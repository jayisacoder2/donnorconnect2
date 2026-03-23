/**
 * Segment Form Component
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { createSegmentSchema } from '@/lib/validation/segment-schema'

export function SegmentForm({ segment, onSubmit, onCancel }) {
  const form = useForm({
    resolver: zodResolver(createSegmentSchema.partial()),
    defaultValues: {
      name: segment?.name || '',
      description: segment?.description || '',
      rules: segment?.rules ? JSON.stringify(segment.rules, null, 2) : '',
    },
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      const parsedRules = data.rules ? JSON.parse(data.rules) : {}
      await onSubmit?.({
        name: data.name,
        description: data.description || null,
        rules: parsedRules,
      })
    } catch (err) {
      console.error('Segment submit error', err)
      form.setError('rules', { message: 'Rules must be valid JSON' })
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

        <FormField
          control={form.control}
          name="rules"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rules (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder={`{
  "retentionRisk": ["HIGH", "CRITICAL"],
  "totalGiftAmountRange": { "min": 500 }
}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Segment'}
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
// <SegmentForm 
//   segment={editingSegment} 
//   onSubmit={handleCreateSegment}
//   onCancel={() => setShowForm(false)}
// />