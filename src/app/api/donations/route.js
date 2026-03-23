// Donations API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { donationListQuerySchema, createDonationSchema } from '@/lib/validation/donation-schema'
import { updateDonorMetrics } from '@/lib/api/donors'
import { triggerWorkflows } from '@/lib/api/workflows'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const params = donationListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))

    const where = {
      donor: { organizationId: session.user.organizationId },
      ...(params.donorId ? { donorId: params.donorId } : {}),
      ...(params.campaignId ? { campaignId: params.campaignId } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.startDate || params.endDate
        ? {
            date: {
              ...(params.startDate ? { gte: params.startDate } : {}),
              ...(params.endDate ? { lte: params.endDate } : {}),
            },
          }
        : {}),
      ...(params.minAmount || params.maxAmount
        ? {
            amount: {
              ...(params.minAmount ? { gte: params.minAmount } : {}),
              ...(params.maxAmount ? { lte: params.maxAmount } : {}),
            },
          }
        : {}),
    }

    const skip = (params.page - 1) * params.limit

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { [params.sortBy]: params.sortOrder },
        include: { donor: true, campaign: true },
      }),
      prisma.donation.count({ where }),
    ])

    return NextResponse.json({ donations, pagination: { total, page: params.page, limit: params.limit } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createDonationSchema.parse(body)

    // Ensure donor belongs to organization
    const donor = await prisma.donor.findFirst({ where: { id: data.donorId, organizationId: session.user.organizationId } })
    if (!donor) return NextResponse.json({ error: 'Donor not found' }, { status: 404 })

    // Ensure campaign, if provided, belongs to org
    if (data.campaignId) {
      const campaign = await prisma.campaign.findFirst({ where: { id: data.campaignId, organizationId: session.user.organizationId } })
      if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const donation = await prisma.donation.create({ data })
    await updateDonorMetrics(data.donorId)

    // Check if this is the donor's first donation
    const donationCount = await prisma.donation.count({ where: { donorId: data.donorId } })
    const isFirstDonation = donationCount === 1

    // Trigger workflows
    await triggerWorkflows({
      trigger: isFirstDonation ? 'FIRST_DONATION' : 'DONATION_RECEIVED',
      organizationId: session.user.organizationId,
      donorId: data.donorId,
      context: {
        donationId: donation.id,
        amount: donation.amount,
        campaignId: donation.campaignId,
      },
    })

    return NextResponse.json({ donation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
