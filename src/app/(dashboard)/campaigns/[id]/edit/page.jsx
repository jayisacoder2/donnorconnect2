"use client"

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateCampaignSchema } from '@/lib/validation/campaign-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast, Toaster } from '@/lib/toast'

export default function EditCampaignPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { toast, toasts, dismissToast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateCampaignSchema),
  })

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaigns/${id}`)
        if (!res.ok) throw new Error('Failed to load campaign')
        const { campaign } = await res.json()
        
        // Format dates for input fields
        const formData = {
          name: campaign.name || '',
          description: campaign.description || '',
          goal: campaign.goal || '',
          status: campaign.status || 'DRAFT',
          startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
          endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        }
        reset(formData)
      } catch (error) {
        toast.error('Failed to load campaign')
      } finally {
        setFetching(false)
      }
    }
    fetchCampaign()
  }, [id, reset, toast])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update campaign')
      }

      toast.success('Campaign updated successfully')
      router.push(`/campaigns/${id}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-white">Loading campaign...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toaster toasts={toasts} onDismiss={dismissToast} />
      
      <div className="flex items-center gap-4">
        <Link href={`/campaigns/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Edit Campaign</h1>
          <p className="text-gray-400">Update campaign details</p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Modify the goals and timeline for this campaign.
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

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded border border-slate-800 bg-slate-950 px-3 py-2 text-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-400">{errors.status.message}</p>
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
              <Link href={`/campaigns/${id}`}>
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="btn-gradient">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
