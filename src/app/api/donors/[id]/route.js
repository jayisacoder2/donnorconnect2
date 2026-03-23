// Donors API - Individual Donor Operations
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { updateDonorSchema } from '@/lib/validation/donor-schema'
import { updateDonorMetrics, getDonor } from '@/lib/api/donors'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const donor = await getDonor({
      id,
      organizationId: session.user.organizationId,
    })

    if (!donor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ donor })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateDonorSchema.parse(body)

    // If email is being updated, check for duplicates
    if (data.email) {
      const existingDonor = await prisma.donor.findFirst({
        where: {
          email: { equals: data.email, mode: 'insensitive' },
          organizationId: session.user.organizationId,
          id: { not: id }, // Exclude the current donor
        },
      })

      if (existingDonor) {
        return NextResponse.json({ error: 'A donor with this email already exists' }, { status: 409 })
      }
    }

    const donor = await prisma.donor.update({
      where: { id },
      data,
    })

    await updateDonorMetrics(donor.id)

    return NextResponse.json({ donor })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.donor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
