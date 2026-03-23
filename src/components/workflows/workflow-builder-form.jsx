/**
 * Workflow Builder Form - User-friendly workflow creation without JSON
 */

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Mail, Clock, CheckSquare, ArrowRight } from 'lucide-react'

const TRIGGER_OPTIONS = [
  { value: 'FIRST_DONATION', label: 'First Donation', description: 'When a donor gives for the first time' },
  { value: 'DONATION_RECEIVED', label: 'Any Donation', description: 'Every time a donation is received' },
  { value: 'INACTIVITY_THRESHOLD', label: 'Donor Inactivity', description: 'When a donor hasn\'t given in a while' },
  { value: 'SEGMENT_ENTRY', label: 'Segment Entry', description: 'When a donor enters a segment' },
  { value: 'MANUAL', label: 'Manual Trigger', description: 'Start workflow manually' },
  { value: 'SCHEDULED', label: 'Scheduled', description: 'Run on a schedule' },
]

const STEP_TYPES = [
  { value: 'email', label: 'Send Email', icon: Mail, description: 'Send an automated email' },
  { value: 'task', label: 'Create Task', icon: CheckSquare, description: 'Assign a follow-up task to staff' },
  { value: 'wait', label: 'Wait', icon: Clock, description: 'Pause for a period of time' },
]

// Unique ID generator to avoid key collisions
const generateUniqueId = (() => {
  let counter = 0
  return () => {
    counter++
    return `${Date.now()}-${counter}-${Math.random().toString(36).substr(2, 9)}`
  }
})()

export function WorkflowBuilderForm({ workflow, onSubmit, submitting }) {
  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const [isActive, setIsActive] = useState(workflow?.isActive ?? false)
  const [trigger, setTrigger] = useState(workflow?.trigger || 'FIRST_DONATION')
  const [segmentId, setSegmentId] = useState(workflow?.segmentId || '')
  const [steps, setSteps] = useState(() => {
    // Ensure all steps have unique IDs
    const stepsWithIds = (workflow?.steps || []).map(step => 
      step.id ? step : { ...step, id: generateUniqueId() }
    )
    return stepsWithIds
  })
  const [segments, setSegments] = useState([])

  useEffect(() => {
    // Load segments for dropdown
    const loadSegments = async () => {
      try {
        const res = await fetch('/api/segments?page=1&limit=100')
        if (res.ok) {
          const data = await res.json()
          setSegments(data.segments || [])
        }
      } catch (error) {
        console.error('Error loading segments:', error)
      }
    }
    loadSegments()
  }, [])

  const addStep = (type) => {
    const newStep = {
      id: generateUniqueId(),
      type,
      ...(type === 'email' && { subject: '', body: '', template: '' }),
      ...(type === 'task' && { title: '', description: '', assignTo: '', priority: 'normal' }),
      ...(type === 'wait' && { days: 1, hours: 0 }),
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (id, updates) => {
    setSteps(steps.map(step => step.id === id ? { ...step, ...updates } : step))
  }

  const removeStep = (id) => {
    setSteps(steps.filter(step => step.id !== id))
  }

  const moveStep = (index, direction) => {
    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < steps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
      setSteps(newSteps)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a workflow name')
      return
    }
    if (steps.length === 0) {
      alert('Please add at least one step to the workflow')
      return
    }

    // Clean up step objects - remove UI-specific fields
    const cleanSteps = steps.map(({ id, ...step }) => step)

    onSubmit({
      name,
      description: description || null,
      isActive,
      trigger,
      segmentId: segmentId || null,
      steps: cleanSteps,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Workflow Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., First-Time Donor Welcome, Lapsed Donor Re-engagement"
            className="bg-slate-900 border-purple-500/30 text-white placeholder:text-gray-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what this workflow does..."
            className="bg-slate-900 border-purple-500/30 text-white placeholder:text-gray-500"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5 rounded border-2 border-purple-500/50 bg-slate-900 cursor-pointer"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">
            Active (workflow will run automatically)
          </label>
        </div>
      </div>

      <hr className="border-purple-500/20" />

      {/* Trigger */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">When should this workflow start?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRIGGER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTrigger(option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                trigger === option.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-purple-500/30 bg-slate-900/50 hover:border-purple-500/50'
              }`}
            >
              <div className="font-medium text-white">{option.label}</div>
              <div className="text-xs text-gray-400 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Segment Filter */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Target Segment (Optional)</label>
        <select
          value={segmentId}
          onChange={(e) => setSegmentId(e.target.value)}
          className="w-full rounded-lg border-2 border-purple-500/30 px-3 py-2 bg-slate-900 text-white cursor-pointer"
        >
          <option value="">All Donors</option>
          {segments.map((seg) => (
            <option key={seg.id} value={seg.id}>
              {seg.name} ({seg.memberCount || 0} donors)
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Only run this workflow for donors in a specific segment
        </p>
      </div>

      <hr className="border-purple-500/20" />

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">What should happen? (Steps)</h3>
          <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-300">{steps.length} step{steps.length !== 1 ? 's' : ''}</Badge>
        </div>

        {steps.length > 0 && (
          <div className="space-y-3 mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <Badge className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-600 text-white">
                      {index + 1}
                    </Badge>
                    {index < steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 rotate-90" />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-medium bg-purple-500/20 border-purple-500/50 text-purple-300">
                        {STEP_TYPES.find(t => t.value === step.type)?.label || step.type}
                      </Badge>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <Button
                            key="move-up"
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, 'up')}
                            className="text-gray-400 hover:text-gray-300 hover:bg-purple-500/20"
                          >
                            ↑
                          </Button>
                        )}
                        {index < steps.length - 1 && (
                          <Button
                            key="move-down"
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, 'down')}
                            className="text-gray-400 hover:text-gray-300 hover:bg-purple-500/20"
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          key="remove"
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {step.type === 'email' && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Email subject"
                          value={step.subject || ''}
                          onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                          className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
                        />
                        <Textarea
                          placeholder="Email body"
                          value={step.body || ''}
                          onChange={(e) => updateStep(step.id, { body: e.target.value })}
                          rows={3}
                          className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
                        />
                        <Input
                          placeholder="Template name (optional)"
                          value={step.template || ''}
                          onChange={(e) => updateStep(step.id, { template: e.target.value })}
                          className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
                        />
                      </div>
                    )}

                    {step.type === 'task' && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Task title"
                          value={step.title || ''}
                          onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
                        />
                        <Textarea
                          placeholder="Task description"
                          value={step.description || ''}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                          rows={2}
                          className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
                        />
                        <Input
                          placeholder="Assign to (user ID or 'admin')"
                          value={step.assignTo || ''}
                          onChange={(e) => updateStep(step.id, { assignTo: e.target.value })}
                          className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
                        />
                        <select
                          value={step.priority || 'normal'}
                          onChange={(e) => updateStep(step.id, { priority: e.target.value })}
                          className="w-full rounded-lg border-2 border-purple-500/30 px-3 py-2 bg-slate-800 text-white cursor-pointer text-sm"
                        >
                          <option value="low">Low Priority</option>
                          <option value="normal">Normal Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    )}

                    {step.type === 'wait' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">Wait for</span>
                          <Input
                            type="number"
                            min="0"
                            value={step.days || 0}
                            onChange={(e) => updateStep(step.id, { days: parseInt(e.target.value) || 0 })}
                            className="w-20 bg-slate-800 border-purple-500/30 text-white"
                          />
                          <span className="text-sm text-gray-300">days</span>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={step.hours || 0}
                            onChange={(e) => updateStep(step.id, { hours: parseInt(e.target.value) || 0 })}
                            className="w-20 bg-slate-800 border-purple-500/30 text-white"
                          />
                          <span className="text-sm text-gray-300">hours</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {STEP_TYPES.map((stepType) => {
            const Icon = stepType.icon
            return (
              <Button
                key={stepType.value}
                type="button"
                variant="outline"
                onClick={() => addStep(stepType.value)}
                className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50"
              >
                <Icon className="h-4 w-4" />
                Add {stepType.label}
              </Button>
            )
          })}
        </div>

        {steps.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-purple-500/30 rounded-lg bg-slate-900/30">
            <p className="mb-2">No steps added yet</p>
            <p className="text-sm text-gray-500">Click the buttons above to add workflow steps</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white">
          {submitting ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  )
}
