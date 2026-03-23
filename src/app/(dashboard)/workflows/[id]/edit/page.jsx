"use client"

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { WorkflowBuilderForm } from '@/components/workflows/workflow-builder-form'

export default function EditWorkflowPage({ params }) {
  const { id: workflowId } = use(params)
  const router = useRouter()
  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadWorkflow = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/workflows/${workflowId}`)
        if (!res.ok) throw new Error('Failed to load workflow')
        const data = await res.json()
        setWorkflow(data.workflow || null)
      } catch (err) {
        setError('Unable to load workflow')
      } finally {
        setLoading(false)
      }
    }

    loadWorkflow()
  }, [workflowId])

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push(`/workflows/${workflowId}`)
      } else {
        alert('Failed to update workflow')
      }
    } catch (error) {
      console.error('Error updating workflow:', error)
      alert('Failed to update workflow')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-white">Loading workflow...</div>
  if (error || !workflow) return <div className="text-white">{error || 'Workflow not found.'}</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Workflow</h1>
          <p className="text-gray-400 mt-1">{workflow.name}</p>
        </div>
        <Link href={`/workflows/${workflowId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <div className="glass-card p-6 border border-purple-500/20">
        <WorkflowBuilderForm
          workflow={workflow}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </div>
    </div>
  )
}
