// Business logic for donor operations
import { prisma } from '../db'
import { updateDonorSchema } from '../validation/donor-schema'
import { triggerWorkflows } from './workflows'
import { buildDonorWhereFromSegmentRules } from './segment-rules'

/**
 * TODO: Get a single donor by ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object|null>} Donor object or null
 */
export async function getDonor(params) {
  const { id, organizationId } = params || {}
  if (!id || !organizationId) return null

  const donor = await prisma.donor.findFirst({
    where: { id, organizationId },
    include: {
      donations: true,
      interactions: true,
      tasks: true,
    },
  })

  if (!donor) return null

  const totalGifts = donor.donations.length
  const totalAmount = donor.donations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const dates = donor.donations
    .map((d) => d.date || d.receivedAt)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  const firstGiftDate = dates[0] || null
  const lastGiftDate = dates[dates.length - 1] || null

  return {
    ...donor,
    totalGifts,
    totalAmount,
    firstGiftDate,
    lastGiftDate,
    avgGift: totalGifts ? totalAmount / totalGifts : 0,
  }
}

/**
 * TODO: Create a new donor
 * @param {Object} donorData - Donor data to create
 * @returns {Promise<Object>} Created donor object
 */
export async function createDonor(donorData) {
  const data = { ...donorData, email: donorData.email?.trim() }
  const donor = await prisma.donor.create({ data })
  await updateDonorMetrics(donor.id)
  return prisma.donor.findUnique({ where: { id: donor.id } })
}

/**
 * TODO: Update an existing donor
 * @param {Object} params - Update parameters (id, organizationId, data)
 * @returns {Promise<Object>} Updated donor object
 */
export async function updateDonor(params) {
  const { id, organizationId, data } = params || {}
  if (!id || !organizationId || !data) {
    throw new Error('Missing required parameters')
  }

  const parsed = updateDonorSchema.partial().parse(data)

  const updated = await prisma.donor.update({
    where: { id, organizationId },
    data: parsed,
  })

  await updateDonorMetrics(id)
  return prisma.donor.findUnique({ where: { id } })
}

/**
 * TODO: Delete a donor
 * @param {Object} params - Delete parameters (id, organizationId)
 */
export async function deleteDonor(params) {
  const { id, organizationId } = params || {}
  if (!id || !organizationId) {
    throw new Error('Missing required parameters')
  }

  await prisma.donor.delete({ where: { id, organizationId } })
}

/**
 * TODO: Update donor metrics after donation changes
 * @param {string} donorId - Donor ID to update metrics for
 */
export async function updateDonorMetrics(donorId) {
  const donations = await prisma.donation.findMany({
    where: { donorId },
    orderBy: { date: 'desc' },
  })

  const totalGifts = donations.length
  const totalAmount = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0)

  const dates = donations
    .map((donation) => donation.date || donation.receivedAt)
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  const firstGiftDate = dates[0] || null
  const lastGiftDate = dates[dates.length - 1] || null

  let retentionRisk = 'UNKNOWN'
  if (lastGiftDate) {
    const daysSinceLastGift = (Date.now() - lastGiftDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastGift >= 365) {
      retentionRisk = 'CRITICAL'
    } else if (daysSinceLastGift >= 180) {
      retentionRisk = 'HIGH'
    } else {
      retentionRisk = 'LOW'
    }
  }

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      totalGifts,
      totalAmount,
      firstGiftDate,
      lastGiftDate,
      retentionRisk,
    },
  })

  // After metrics update, refresh segment memberships for this donor
  await refreshSegmentsForDonor(donorId)
}

/**
 * Recalculate segment membership for a single donor across all org segments
 * Ensures segments reflect latest donor metrics automatically
 */
async function refreshSegmentsForDonor(donorId) {
  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
    select: {
      id: true,
      organizationId: true,
      retentionRisk: true,
      status: true,
      totalGifts: true,
      totalAmount: true,
      lastGiftDate: true,
      email: true,
    },
  })
  if (!donor) return

  const segments = await prisma.segment.findMany({
    where: { organizationId: donor.organizationId },
    select: { id: true, rules: true },
  })

  for (const seg of segments) {
    const rules = seg.rules || {}
    
    // Use the new rule translator
    const donorWhere = buildDonorWhereFromSegmentRules(rules)
    
    // Check if donor matches
    const matches = await prisma.donor.count({
      where: {
        id: donor.id,
        organizationId: donor.organizationId,
        ...donorWhere
      }
    }) > 0

    // Update membership
    const existing = await prisma.segmentMember.findFirst({
      where: { segmentId: seg.id, donorId: donor.id },
      select: { id: true },
    })

    if (matches && !existing) {
      await prisma.segmentMember.create({ data: { segmentId: seg.id, donorId: donor.id } })
      
      // Trigger SEGMENT_ENTRY workflows when donor joins a segment
      // Fetch segment name from segments array for context
      const segmentWithName = await prisma.segment.findUnique({
        where: { id: seg.id },
        select: { name: true },
      })
      
      await triggerWorkflows({
        trigger: 'SEGMENT_ENTRY',
        organizationId: donor.organizationId,
        donorId: donor.id,
        segmentId: seg.id,
        context: { segmentName: segmentWithName?.name || 'Unknown' },
      }).catch(err => console.error('Workflow trigger failed:', err))
    } else if (!matches && existing) {
      await prisma.segmentMember.delete({ where: { id: existing.id } })
    }
  }

  // Update counts for all segments in org
  const counts = await prisma.segmentMember.groupBy({
    by: ['segmentId'],
    _count: { segmentId: true },
    where: { segment: { organizationId: donor.organizationId } },
  })

  const countMap = new Map(counts.map(c => [c.segmentId, c._count.segmentId]))
  const allSegs = await prisma.segment.findMany({
    where: { organizationId: donor.organizationId },
    select: { id: true },
  })
  
  for (const s of allSegs) {
    const n = countMap.get(s.id) || 0
    await prisma.segment.update({ where: { id: s.id }, data: { memberCount: n } })
  }
}