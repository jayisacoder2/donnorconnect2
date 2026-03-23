/**
 * Workflow Form Component
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { createWorkflowSchema, WorkflowTriggerEnum } from '@/lib/validation/workflow-schema'

export function WorkflowForm({ workflow, onSubmit, onCancel }) {
  const form = useForm({
    resolver: zodResolver(createWorkflowSchema.partial()),
    defaultValues: {
      name: workflow?.name || '',
      description: workflow?.description || '',
      isActive: workflow?.isActive ?? false,
      trigger: workflow?.trigger || 'FIRST_DONATION',
      segmentId: workflow?.segmentId || '',
      steps: workflow?.steps ? JSON.stringify(workflow.steps, null, 2) : '',
    },
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const parsedSteps = data.steps ? JSON.parse(data.steps) : []
      await onSubmit?.({
        name: data.name,
        description: data.description || null,
        isActive: data.isActive,
        trigger: data.trigger,
        segmentId: data.segmentId || null,
        steps: parsedSteps,
      })
    } catch (err) {
      console.error('Workflow submit error', err)
      form.setError('steps', { message: 'Steps must be valid JSON array' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="trigger"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trigger</FormLabel>
                <FormControl>
                  <select {...field} className="dark-select w-full">
                    {WorkflowTriggerEnum.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="segmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segment ID (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Segment to target" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              </FormControl>
              <FormLabel className="m-0">Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="steps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Steps (JSON array)</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder='[{ "type": "email", "template": "welcome", "delay": 0 }]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Workflow'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
    </Form>
  )
}

// Example usage:
// <WorkflowForm 
//   workflow={editingWorkflow} 
//   onSubmit={handleCreateWorkflow}
//   onCancel={() => setShowForm(false)}
// />