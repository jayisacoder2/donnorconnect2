"use client"

import { use } from 'react'
import { CampaignStatusBadge } from '@/components/campaigns/campaign-status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCampaign } from '@/hooks/use-campaigns'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Campaign detail page
export default function CampaignDetailPage({ params }) {
  const { id } = use(params)
  const { campaign, loading, error } = useCampaign(id)

  if (loading) return <div>Loading campaign...</div>
  if (error || !campaign) return <div>Unable to load campaign.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{campaign.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            {campaign.goal ? (
              <span className="text-sm text-gray-300">Goal: {formatCurrency(campaign.goal)}</span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}/edit`}>
            <Button className="btn-gradient">Edit Campaign</Button>
          </Link>
          <Link href="/campaigns">
            <Button variant="outline">Back to campaigns</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-300">
          <p><span className="font-medium text-white">Description:</span> {campaign.description || 'No description provided.'}</p>
          <p><span className="font-medium text-white">Start:</span> {campaign.startDate ? formatDate(campaign.startDate) : '—'}</p>
          <p><span className="font-medium text-white">End:</span> {campaign.endDate ? formatDate(campaign.endDate) : '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Donations ({campaign.donations?.length || 0})</CardTitle>
          {campaign.totalRaised > 0 && (
            <p className="text-sm text-gray-400">Total raised: {formatCurrency(campaign.totalRaised)}</p>
          )}
        </CardHeader>
        <CardContent>
          {campaign.donations && campaign.donations.length > 0 ? (
            <div className="space-y-3">
              {campaign.donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b border-gray-700 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-white">
                      {donation.donor?.firstName} {donation.donor?.lastName}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatDate(donation.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-400">{formatCurrency(donation.amount)}</p>
                    <p className="text-xs text-gray-500">{donation.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No donations yet for this campaign.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
