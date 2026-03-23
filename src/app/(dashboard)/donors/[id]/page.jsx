'use client'

import { use } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DonorStatusBadge } from '@/components/donors/donor-status-badge'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'
import { useDonor } from '@/hooks/use-donors'
import { formatCurrency, formatDate } from '@/lib/utils'

// Donor detail page
export default function DonorDetailPage({ params }) {
  const { id } = use(params)
  const { donor, loading, error } = useDonor(id)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  if (loading) {
    return <div>Loading donor...</div>
  }

  if (error || !donor) {
    return <div>Unable to load donor.</div>
  }

  const generateSummary = async () => {
    setSummaryError('')
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/ai/summarize-donor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to summarize')
      setSummary(data.summary)
    } catch (err) {
      setSummaryError(err.message)
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {donor.firstName} {donor.lastName}
          </h1>
          <p className="text-gray-400">{donor.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <DonorStatusBadge status={donor.status} />
            <RetentionRiskBadge risk={donor.retentionRisk} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/donors/${donor.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href="/donors">
            <Button variant="outline">Back to list</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(donor.totalAmount || 0)}</p>
              <p className="text-sm text-gray-400">Total raised from this donor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{donor.totalGifts ?? 0}</p>
              <p className="text-sm text-gray-400">Gifts recorded</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Last Gift</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{donor.lastGiftDate ? formatDate(donor.lastGiftDate) : '—'}</p>
              <p className="text-sm text-gray-400">Most recent donation date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>AI Donor Summary</CardTitle>
          </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
            <Button variant="outline" onClick={generateSummary} disabled={summaryLoading}>
              {summaryLoading ? 'Generating...' : 'Generate AI Summary'}
            </Button>
            {summaryError && <p className="text-red-600">{summaryError}</p>}
              {summary && <p className="text-gray-200 leading-relaxed">{summary}</p>}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
            <p><span className="font-medium">Phone:</span> {donor.phone || '—'}</p>
            <p><span className="font-medium">Address:</span> {donor.address || '—'}</p>
            <p><span className="font-medium">City:</span> {donor.city || '—'}</p>
            <p><span className="font-medium">State:</span> {donor.state || '—'}</p>
            <p><span className="font-medium">Zip:</span> {donor.zipCode || '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
          <CardContent className="text-sm text-white">
          {donor.notes || 'No notes yet.'}
        </CardContent>
      </Card>
    </div>
  )
}
