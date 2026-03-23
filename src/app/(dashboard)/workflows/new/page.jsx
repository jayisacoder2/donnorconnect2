"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkflowBuilderForm } from '@/components/workflows/workflow-builder-form'

export default function NewWorkflowPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (res.ok) {
        const result = await res.json()
        router.push(`/workflows/${result.workflow.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create workflow')
      }
    } catch (error) {
      console.error('Error creating workflow:', error)
      alert('Failed to create workflow')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Workflow</h1>
          <p className="text-gray-400 mt-2">Automate donor engagement and follow-ups</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/workflows')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowBuilderForm onSubmit={handleSubmit} submitting={submitting} />
        </CardContent>
      </Card>
    </div>
  )
}
