"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DonationForm } from '@/components/donations/donation-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// New donation form page
export default function NewDonationPage() {
  const router = useRouter()
  const [donors, setDonors] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [donorsRes, campaignsRes] = await Promise.all([
          fetch('/api/donors?limit=100'),
          fetch('/api/campaigns?limit=100')
        ])
        
        if (!donorsRes.ok) {
          throw new Error('Failed to load donors')
        }
        if (!campaignsRes.ok) {
          throw new Error('Failed to load campaigns')
        }
        
        const donorsData = await donorsRes.json()
        const campaignsData = await campaignsRes.json()
        setDonors(donorsData.donors || [])
        setCampaigns(campaignsData.campaigns || [])
      } catch (err) {
        setError(err.message || 'Unable to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = async (data) => {
    setError('')
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      setError(payload?.error || 'Failed to save donation')
      return
    }

    router.push('/donations')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Record Donation</h1>
        <p className="text-gray-400 mt-2">Log a gift and keep donor metrics up to date.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DonationForm 
              donors={donors} 
              campaigns={campaigns}
              onSubmit={handleCreate} 
              onCancel={() => router.back()} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
