// Campaigns API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { campaignListQuerySchema, createCampaignSchema } from '@/lib/validation/campaign-schema'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const params = campaignListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))

    const where = {
      organizationId: session.user.organizationId,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { description: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(params.status ? { status: params.status } : {}),
    }

    const skip = (params.page - 1) * params.limit

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.campaign.count({ where }),
    ])

    return NextResponse.json({ campaigns, pagination: { total, page: params.page, limit: params.limit } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF', 'MARKETING'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createCampaignSchema.parse(body)

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}