/**
 * Public Campaigns API
 * Returns active campaigns for public donation page
 * NO authentication required
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get the first organization (in real multi-tenant app, would use subdomain)
    const organization = await prisma.organization.findFirst()
    
    if (!organization) {
      return NextResponse.json({ campaigns: [] })
    }

    // Fetch only ACTIVE campaigns with donations
    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId: organization.id,
        status: 'ACTIVE',
      },
      include: {
        donations: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    // Calculate raised amount for each campaign
    const campaignsWithRaised = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      goal: campaign.goal,
      raised: campaign.donations.reduce((sum, d) => sum + d.amount, 0),
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    }))

    return NextResponse.json({ campaigns: campaignsWithRaised })
  } catch (error) {
    console.error('Public campaigns error:', error)
    return NextResponse.json(
      { error: 'Failed to load campaigns' },
      { status: 500 }
    )
  }
}
