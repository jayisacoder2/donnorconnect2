// Segment rules translator - converts segment rule JSON to Prisma where clauses
import { prisma } from '../db'

/**
 * Translate segment rules into Prisma where clause for Donor queries
 * 
 * Rules format:
 * - Leaf rule: { field: string, operator: string, value: any }
 * - Compound: { and: [rules...] } or { or: [rules...] }
 * 
 * Supported operators:
 * - equals, notEquals
 * - in, notIn
 * - greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual
 * - contains, notContains (case-insensitive)
 * - before, after (date parsing)
 * 
 * Special computed field:
 * - field: "hasRecurring" → filters on donations relation
 * 
 * @param {Object} rules - Segment rules object
 * @returns {Object} Prisma where clause
 */
export function buildDonorWhereFromSegmentRules(rules) {
  if (!rules || typeof rules !== 'object') {
    return {}
  }

  // Handle compound rules
  if (rules.and) {
    return {
      AND: rules.and.map(r => buildDonorWhereFromSegmentRules(r))
    }
  }

  if (rules.or) {
    return {
      OR: rules.or.map(r => buildDonorWhereFromSegmentRules(r))
    }
  }

  // Handle leaf rule
  if (rules.field && rules.operator) {
    return buildLeafCondition(rules.field, rules.operator, rules.value)
  }

  // Handle legacy format (for backward compatibility)
  return buildLegacyConditions(rules)
}

/**
 * Build condition for a single field/operator/value leaf rule
 */
function buildLeafCondition(field, operator, value) {
  // Special computed field
  if (field === 'hasRecurring') {
    if (value === true) {
      return { donations: { some: { type: 'RECURRING' } } }
    } else if (value === false) {
      return { donations: { none: { type: 'RECURRING' } } }
    }
    return {}
  }

  // Standard field operators
  switch (operator) {
    case 'equals':
      return { [field]: value }
    
    case 'notEquals':
      return { [field]: { not: value } }
    
    case 'in':
      return { [field]: { in: Array.isArray(value) ? value : [value] } }
    
    case 'notIn':
      return { [field]: { notIn: Array.isArray(value) ? value : [value] } }
    
    case 'greaterThan':
      return { [field]: { gt: value } }
    
    case 'greaterThanOrEqual':
      return { [field]: { gte: value } }
    
    case 'lessThan':
      return { [field]: { lt: value } }
    
    case 'lessThanOrEqual':
      return { [field]: { lte: value } }
    
    case 'contains':
      return { [field]: { contains: value, mode: 'insensitive' } }
    
    case 'notContains':
      return { [field]: { not: { contains: value, mode: 'insensitive' } } }
    
    case 'before':
      return { [field]: { lt: new Date(value) } }
    
    case 'after':
      return { [field]: { gt: new Date(value) } }
    
    default:
      console.warn(`Unknown operator: ${operator}`)
      return {}
  }
}

/**
 * Build conditions from legacy format (for backward compatibility)
 * Supports the old format with direct field filters
 */
function buildLegacyConditions(rules) {
  const where = {}

  // Status array
  if (rules.status?.length) {
    where.status = { in: rules.status }
  }

  // Retention risk array
  if (rules.retentionRisk?.length) {
    where.retentionRisk = { in: rules.retentionRisk }
  }

  // Gift count range (support both field names)
  const giftRange = rules.giftCountRange || rules.totalGiftsRange
  if (giftRange) {
    where.totalGifts = {}
    if (giftRange.min !== undefined) where.totalGifts.gte = giftRange.min
    if (giftRange.max !== undefined) where.totalGifts.lte = giftRange.max
  }

  // Total amount range (support both field names)
  const amountRange = rules.totalGiftAmountRange || rules.totalAmountRange
  if (amountRange) {
    where.totalAmount = {}
    if (amountRange.min !== undefined) where.totalAmount.gte = amountRange.min
    if (amountRange.max !== undefined) where.totalAmount.lte = amountRange.max
  }

  // Last gift date range
  if (rules.lastGiftDateRange) {
    where.lastGiftDate = {}
    if (rules.lastGiftDateRange.start) {
      where.lastGiftDate.gte = new Date(rules.lastGiftDateRange.start)
    }
    if (rules.lastGiftDateRange.end) {
      where.lastGiftDate.lte = new Date(rules.lastGiftDateRange.end)
    }
  }

  // Days since last gift (legacy)
  if (rules.daysSinceLastGift !== undefined) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - rules.daysSinceLastGift)
    where.lastGiftDate = { lt: cutoffDate }
  }

  // Email presence
  if (rules.hasEmail === true) {
    where.email = { not: null }
  } else if (rules.hasEmail === false) {
    where.email = null
  }

  return where
}

/**
 * Compute matching donors for a segment (returns full donor objects)
 * 
 * @param {string} organizationId - Organization ID
 * @param {Object} rules - Segment rules
 * @param {Object} options - Query options (limit, select fields)
 * @returns {Promise<Array>} Array of matching donors
 */
export async function computeSegmentDonors(organizationId, rules, options = {}) {
  const { limit = 1000, select } = options
  
  const donorWhere = buildDonorWhereFromSegmentRules(rules)
  
  const where = {
    organizationId,
    ...donorWhere
  }

  return await prisma.donor.findMany({
    where,
    take: limit,
    select: select || {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      retentionRisk: true,
      totalGifts: true,
      totalAmount: true,
      lastGiftDate: true,
    },
    orderBy: { totalAmount: 'desc' }
  })
}

/**
 * Count matching donors for a segment
 * 
 * @param {string} organizationId - Organization ID
 * @param {Object} rules - Segment rules
 * @returns {Promise<number>} Count of matching donors
 */
export async function countSegmentDonors(organizationId, rules) {
  const donorWhere = buildDonorWhereFromSegmentRules(rules)
  
  const where = {
    organizationId,
    ...donorWhere
  }

  return await prisma.donor.count({ where })
}

/**
 * Sync SegmentMember table for a segment (authoritative membership)
 * 
 * @param {string} segmentId - Segment ID
 * @param {string} organizationId - Organization ID
 * @param {Object} rules - Segment rules
 * @returns {Promise<Object>} { addedCount, removedCount, totalCount }
 */
export async function syncSegmentMembership(segmentId, organizationId, rules) {
  return await prisma.$transaction(async (tx) => {
    // Compute matching donor IDs
    const donorWhere = buildDonorWhereFromSegmentRules(rules)
    const matchingDonors = await tx.donor.findMany({
      where: { organizationId, ...donorWhere },
      select: { id: true }
    })
    
    const matchingIds = new Set(matchingDonors.map(d => d.id))
    
    // Get current members
    const currentMembers = await tx.segmentMember.findMany({
      where: { segmentId },
      select: { donorId: true }
    })
    
    const currentIds = new Set(currentMembers.map(m => m.donorId))
    
    // Calculate changes
    const toAdd = [...matchingIds].filter(id => !currentIds.has(id))
    const toRemove = [...currentIds].filter(id => !matchingIds.has(id))
    
    // Remove donors not in the new set
    if (toRemove.length > 0) {
      await tx.segmentMember.deleteMany({
        where: {
          segmentId,
          donorId: { in: toRemove }
        }
      })
    }
    
    // Add new members
    if (toAdd.length > 0) {
      await tx.segmentMember.createMany({
        data: toAdd.map(donorId => ({ segmentId, donorId })),
        skipDuplicates: true
      })
    }
    
    // Update segment cached count
    await tx.segment.update({
      where: { id: segmentId },
      data: {
        memberCount: matchingIds.size,
        lastCalculated: new Date()
      }
    })
    
    return {
      addedCount: toAdd.length,
      removedCount: toRemove.length,
      totalCount: matchingIds.size
    }
  })
}
