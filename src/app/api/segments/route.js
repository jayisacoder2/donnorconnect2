// Segments API - List and Create
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { createSegmentSchema, segmentListQuerySchema } from '@/lib/validation/segment-schema'
import { countSegmentDonors, syncSegmentMembership } from '@/lib/api/segment-rules'

export async function GET(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const params = segmentListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))

    const where = {
      organizationId: session.user.organizationId,
      ...(params.search
        ? {
            name: { contains: params.search, mode: 'insensitive' },
          }
        : {}),
    }

    const skip = (params.page - 1) * params.limit

    const [segments, total] = await Promise.all([
      prisma.segment.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.segment.count({ where }),
    ])

    return NextResponse.json({ 
      segments, 
      pagination: { total, page: params.page, limit: params.limit } 
    })
  } catch (error) {
    console.error('Error in GET /api/segments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = session.user.role
    if (!['ADMIN', 'STAFF'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createSegmentSchema.parse(body)
    const organizationId = session.user.organizationId

    // Create segment
    const segment = await prisma.segment.create({
      data: {
        ...data,
        organizationId,
        memberCount: 0,
        lastCalculated: new Date(),
      },
    })

    // Sync membership (computes + materializes join table)
    const syncResult = await syncSegmentMembership(segment.id, organizationId, data.rules)

    return NextResponse.json({ 
      segment: {
        ...segment,
        memberCount: syncResult.totalCount,
        lastCalculated: new Date()
      },
      memberCount: syncResult.totalCount
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating segment:', error)
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
