/**
 * Donation Form Component
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { createDonationSchema } from '@/lib/validation/donation-schema'

export function DonationForm({ donation, donors, campaigns = [], onSubmit, onCancel }) {
  const form = useForm({
    resolver: zodResolver(createDonationSchema.partial({ donorId: false, amount: false, date: false })),
    defaultValues: {
      donorId: donation?.donorId || donors?.[0]?.id || '',
      campaignId: donation?.campaignId || '',
      amount: donation?.amount || '',
      date: donation ? new Date(donation.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      type: donation?.type || 'ONE_TIME',
      method: donation?.method || '',
      notes: donation?.notes || '',
    },
  })

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (data) => {
    setSubmitting(true)
    try {
      await onSubmit?.({
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date),
        campaignId: data.campaignId || null,
        method: data.method || null,
        notes: data.notes || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <FormField
          control={form.control}
          name="donorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Donor</FormLabel>
              <FormControl>
                <select {...field} className="dark-select w-full">
                  {donors?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName} ({d.email})
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <select {...field} className="dark-select w-full">
                    <option value="ONE_TIME">One-time</option>
                    <option value="RECURRING">Recurring</option>
                    <option value="PLEDGE">Pledge</option>
                    <option value="IN_KIND">In-kind</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <FormControl>
                  <Input placeholder="Credit Card, Check, Wire..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign (optional)</FormLabel>
              <FormControl>
                <select 
                  {...field} 
                  className="dark-select w-full"
                >
                  <option value="">— No campaign —</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Internal notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Donation'}
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
// <DonationForm 
//   donation={editingDonation} 
//   donors={allDonors}
//   onSubmit={handleCreateDonation}
//   onCancel={() => setShowForm(false)}
// />