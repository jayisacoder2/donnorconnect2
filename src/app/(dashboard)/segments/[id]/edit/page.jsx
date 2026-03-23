"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SegmentBuilderForm } from '@/components/segments/segment-builder-form'
import { ArrowLeft } from 'lucide-react'

export default function EditSegmentPage({ params }) {
  const router = useRouter()
  const { id: segmentId } = use(params)
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadSegment = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/segments/${segmentId}`)
        if (!res.ok) throw new Error('Failed to load segment')
        const data = await res.json()
        setSegment(data.segment || null)
      } catch (err) {
        setError('Unable to load segment')
      } finally {
        setLoading(false)
      }
    }
    loadSegment()
  }, [segmentId])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/segments/${segmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (res.ok) {
        router.push(`/segments/${segmentId}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update segment')
      }
    } catch (error) {
      console.error('Error updating segment:', error)
      alert('Failed to update segment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading segment...</div>
  if (error || !segment) return <div>{error || 'Segment not found.'}</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href={`/segments/${segmentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Segment</h1>
          <p className="text-gray-400 mt-2">Update rules and criteria for {segment.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Segment Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <SegmentBuilderForm
            segment={segment}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
