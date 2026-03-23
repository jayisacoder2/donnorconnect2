'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DonorForm } from '@/components/donors/donor-form'
import { useDonor } from '@/hooks/use-donors'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Donor edit page
export default function EditDonorPage({ params }) {
  const router = useRouter()
  const { id } = use(params)
  const { donor, loading, error } = useDonor(id)
  const [submitError, setSubmitError] = useState('')

  const handleUpdate = async (data) => {
    setSubmitError('')
    const res = await fetch(`/api/donors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}))
      setSubmitError(payload?.error || 'Failed to update donor')
      return
    }

    router.push(`/donors/${id}`)
    router.refresh()
  }

  if (loading) return <div>Loading donor...</div>
  if (error || !donor) return <div>Unable to load donor.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Donor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {submitError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
          )}
          <DonorForm donor={donor} onSubmit={handleUpdate} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  )
}
