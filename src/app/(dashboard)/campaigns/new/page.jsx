"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCampaignSchema } from '@/lib/validation/campaign-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast, Toaster } from '@/lib/toast'

export default function NewCampaignPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast, toasts, dismissToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      status: 'DRAFT',
    },
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create campaign')
      }

      const { campaign } = await res.json()
      toast.success('Campaign created successfully')
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />
      
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">New Campaign</h1>
          <p className="text-gray-400">Launch a new fundraising initiative</p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Define the goals and timeline for this campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Campaign Name <span className="text-red-400">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., Winter Appeal 2024"
                className="bg-slate-950 border-slate-800"
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="What is this campaign about?"
                className="min-h-[100px] bg-slate-950 border-slate-800"
              />
              {errors.description && (
                <p className="text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Goal Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Fundraising Goal ($)
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('goal')}
                placeholder="10000"
                className="bg-slate-950 border-slate-800"
              />
              {errors.goal && (
                <p className="text-sm text-red-400">{errors.goal.message}</p>
              )}
            </div>

            {/* Dates (Start & End) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Start Date</label>
                <Input
                  type="date"
                  {...register('startDate')}
                  className="bg-slate-950 border-slate-800"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">End Date</label>
                <Input
                  type="date"
                  {...register('endDate')}
                  className="bg-slate-950 border-slate-800"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-400">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/campaigns">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="btn-gradient">
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
