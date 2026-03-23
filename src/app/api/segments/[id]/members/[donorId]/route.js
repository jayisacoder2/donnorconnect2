// Segment Member Individual Operations - Remove one donor
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id: segmentId, donorId } = await params

    // Verify segment belongs to organization
    const segment = await prisma.segment.findFirst({
      where: { id: segmentId, organizationId: session.user.organizationId },
    })

    if (!segment) return NextResponse.json({ error: 'Segment not found' }, { status: 404 })

    // Remove donor from segment
    await prisma.segmentMember.deleteMany({
      where: {
        segmentId,
        donorId,
      },
    })

    // Update cached member count
    const newCount = await prisma.segmentMember.count({ where: { segmentId } })
    await prisma.segment.update({
      where: { id: segmentId },
      data: { memberCount: newCount },
    })

    return NextResponse.json({ 
      success: true,
      totalMembers: newCount
    })
  } catch (error) {
    console.error('Error removing segment member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
