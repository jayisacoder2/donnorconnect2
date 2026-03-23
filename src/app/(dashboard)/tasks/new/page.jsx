"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast, Toaster } from '@/lib/toast'

export default function NewTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [donors, setDonors] = useState([])
  const { toast, toasts, dismissToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      priority: 'MEDIUM',
      status: 'TODO',
    },
  })

  useEffect(() => {
    // Fetch donors for the dropdown
    fetch('/api/donors')
      .then(res => res.json())
      .then(data => setDonors(data.donors || []))
      .catch(console.error)
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create task')
      }

      toast.success('Task created successfully')
      router.push('/tasks')
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
        <Link href="/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">New Task</h1>
          <p className="text-gray-400">Create a follow-up or reminder</p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Set up a new task or reminder for donor follow-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Task Title <span className="text-red-400">*</span>
              </label>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="e.g., Send thank you letter"
                className="bg-slate-950 border-slate-800"
              />
              {errors.title && (
                <p className="text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Description
              </label>
              <Textarea
                {...register('description')}
                placeholder="Additional details about this task..."
                className="min-h-[100px] bg-slate-950 border-slate-800"
              />
            </div>

            {/* Donor (optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Related Donor
              </label>
              <select
                {...register('donorId')}
                className="w-full h-10 rounded-md border-2 border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="">No donor (general task)</option>
                {donors.map(donor => (
                  <option key={donor.id} value={donor.id}>
                    {donor.firstName} {donor.lastName} ({donor.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full h-10 rounded-md border-2 border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Due Date</label>
                <Input
                  type="date"
                  {...register('dueDate')}
                  className="bg-slate-950 border-slate-800 date-input-light"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/tasks">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="btn-gradient">
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
