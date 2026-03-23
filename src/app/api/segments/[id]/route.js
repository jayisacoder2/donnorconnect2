// Segments API - Individual Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateSegmentSchema } from '@/lib/validation/segment-schema'
import { computeSegmentDonors, countSegmentDonors, syncSegmentMembership } from '@/lib/api/segment-rules'

export async function GET(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!segment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Sync membership and get updated count
    try {
      await syncSegmentMembership(id, session.user.organizationId, segment.rules)
      
      // Fetch updated segment with members (donors)
      const updated = await prisma.segment.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              donor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  status: true,
                  retentionRisk: true,
                  totalGifts: true,
                  totalAmount: true,
                  lastGiftDate: true,
                }
              }
            }
          }
        }
      })
      
      // Transform members to donors array for easier consumption
      const donors = updated.members.map(m => m.donor)
      
      return NextResponse.json({ 
        segment: {
          ...updated,
          lastCalculated: new Date(),
          donors
        }
      })
    } catch (syncError) {
      console.error('Error syncing segment membership:', syncError)
      // Return segment without sync if there's an error
      return NextResponse.json({ segment })
    }
  } catch (error) {
    console.error('Error fetching segment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateSegmentSchema.parse(body)
    const organizationId = session.user.organizationId

    // Update segment
    const segment = await prisma.segment.update({
      where: { id },
      data: {
        ...data,
        lastCalculated: new Date(),
      },
    })

    // If rules changed, sync membership
    if (data.rules) {
      await syncSegmentMembership(id, organizationId, data.rules)
    }

    // Fetch updated segment with count
    const updated = await prisma.segment.findUnique({
      where: { id }
    })

    return NextResponse.json({ segment: updated })
  } catch (error) {
    console.error('Error updating segment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await prisma.segment.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
