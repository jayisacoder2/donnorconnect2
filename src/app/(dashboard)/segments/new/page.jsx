"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SegmentBuilderForm } from '@/components/segments/segment-builder-form'

export default function NewSegmentPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (res.ok) {
        const result = await res.json()
        router.push(`/segments/${result.segment.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create segment')
      }
    } catch (error) {
      console.error('Error creating segment:', error)
      alert('Failed to create segment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Segment</h1>
          <p className="text-gray-400 mt-2">Build a group of donors based on their giving behavior</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/segments')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SegmentBuilderForm onSubmit={handleSubmit} submitting={submitting} />
        </CardContent>
      </Card>
    </div>
  )
}
