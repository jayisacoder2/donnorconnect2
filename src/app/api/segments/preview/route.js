import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    const session = await getSession(sessionToken)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rules } = await request.json()
    const organizationId = session.user.organization.id

    // Build Prisma query from rules
    const where = { organizationId }

    if (rules.retentionRisk && rules.retentionRisk.length > 0) {
      where.retentionRisk = { in: rules.retentionRisk }
    }

    if (rules.status && rules.status.length > 0) {
      where.status = { in: rules.status }
    }

    if (rules.totalGiftsRange) {
      where.totalGifts = {}
      if (rules.totalGiftsRange.min !== undefined) {
        where.totalGifts.gte = rules.totalGiftsRange.min
      }
      if (rules.totalGiftsRange.max !== undefined) {
        where.totalGifts.lte = rules.totalGiftsRange.max
      }
    }

    if (rules.totalAmountRange) {
      where.totalAmount = {}
      if (rules.totalAmountRange.min !== undefined) {
        where.totalAmount.gte = rules.totalAmountRange.min
      }
      if (rules.totalAmountRange.max !== undefined) {
        where.totalAmount.lte = rules.totalAmountRange.max
      }
    }

    if (rules.daysSinceLastGift !== undefined) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - rules.daysSinceLastGift)
      where.lastGiftDate = { lt: cutoffDate }
    }

    if (rules.hasEmail === true) {
      where.email = { not: null }
    } else if (rules.hasEmail === false) {
      where.email = null
    }

    // Fetch matching donors (limit to 100 for preview)
    const donors = await prisma.donor.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        retentionRisk: true,
        totalGifts: true,
        totalAmount: true,
      },
      take: 100,
      orderBy: { totalAmount: 'desc' },
    })

    return NextResponse.json({ donors, count: donors.length })
  } catch (error) {
    console.error('Error previewing segment:', error)
    return NextResponse.json({ error: 'Failed to preview segment' }, { status: 500 })
  }
}
