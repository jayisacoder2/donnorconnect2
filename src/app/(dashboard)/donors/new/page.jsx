'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DonorForm } from '@/components/donors/donor-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// New donor form page
export default function NewDonorPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleCreate = async (data) => {
    setError('')
    const res = await fetch('/api/donors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      setError(payload?.error || 'Failed to create donor')
      return
    }

    router.push('/donors')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Donor</h1>
        <p className="text-gray-400 mt-2">Create a new donor profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donor Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <DonorForm onSubmit={handleCreate} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  )
}