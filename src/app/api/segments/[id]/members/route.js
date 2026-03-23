// Segment Members API - Get list of donors in a segment + manual add
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Verify segment belongs to organization
    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!segment) return NextResponse.json({ error: 'Segment not found' }, { status: 404 })

    // Get pagination params
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 50
    const skip = (page - 1) * limit

    // Fetch segment members with donor details
    const [members, total] = await Promise.all([
      prisma.segmentMember.findMany({
        where: { segmentId: id },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              status: true,
              retentionRisk: true,
              totalGifts: true,
              totalAmount: true,
              lastGiftDate: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { donor: { totalAmount: 'desc' } },
      }),
      prisma.segmentMember.count({ where: { segmentId: id } }),
    ])

    const donors = members.map(m => m.donor)

    return NextResponse.json({
      donors,
      pagination: { total, page, limit },
    })
  } catch (error) {
    console.error('Error fetching segment members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { donorIds } = body

    if (!Array.isArray(donorIds) || donorIds.length === 0) {
      return NextResponse.json({ error: 'donorIds must be a non-empty array' }, { status: 400 })
    }

    // Verify segment belongs to organization
    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!segment) return NextResponse.json({ error: 'Segment not found' }, { status: 404 })

    // Verify all donors belong to organization
    const validDonors = await prisma.donor.findMany({
      where: {
        id: { in: donorIds },
        organizationId: session.user.organizationId,
      },
      select: { id: true },
    })

    if (validDonors.length !== donorIds.length) {
      return NextResponse.json({ error: 'Some donors not found or do not belong to your organization' }, { status: 400 })
    }

    // Add donors to segment (manual override)
    await prisma.segmentMember.createMany({
      data: donorIds.map(donorId => ({ segmentId: id, donorId })),
      skipDuplicates: true,
    })

    // Update cached member count
    const newCount = await prisma.segmentMember.count({ where: { segmentId: id } })
    await prisma.segment.update({
      where: { id },
      data: { memberCount: newCount },
    })

    return NextResponse.json({ 
      success: true,
      addedCount: validDonors.length,
      totalMembers: newCount
    })
  } catch (error) {
    console.error('Error adding segment members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
