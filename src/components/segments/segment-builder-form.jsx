/**
 * Segment Builder Form - Simple segment creation
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const RETENTION_RISK_OPTIONS = [
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'LOW', label: 'Low Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'HIGH', label: 'High Risk' },
  { value: 'CRITICAL', label: 'Critical Risk' },
]

const DONOR_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LAPSED', label: 'Lapsed' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DO_NOT_CONTACT', label: 'Do Not Contact' },
]

export function SegmentBuilderForm({ segment, onSubmit, submitting }) {
  const [name, setName] = useState(segment?.name || '')
  const [description, setDescription] = useState(segment?.description || '')
  
  // Rule state
  const [selectedRetentionRisks, setSelectedRetentionRisks] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [minTotalGifts, setMinTotalGifts] = useState('')
  const [maxTotalGifts, setMaxTotalGifts] = useState('')
  const [minTotalAmount, setMinTotalAmount] = useState('')
  const [maxTotalAmount, setMaxTotalAmount] = useState('')

  // Parse existing segment rules
  useEffect(() => {
    if (segment?.rules) {
      const rules = segment.rules
      if (rules.retentionRisk) setSelectedRetentionRisks(rules.retentionRisk)
      if (rules.status) setSelectedStatuses(rules.status)
      
      const giftRange = rules.giftCountRange
      if (giftRange?.min !== undefined) setMinTotalGifts(giftRange.min.toString())
      if (giftRange?.max !== undefined) setMaxTotalGifts(giftRange.max.toString())
      
      const amountRange = rules.totalGiftAmountRange
      if (amountRange?.min !== undefined) setMinTotalAmount(amountRange.min.toString())
      if (amountRange?.max !== undefined) setMaxTotalAmount(amountRange.max.toString())
    }
  }, [segment])

  const buildRules = () => {
    const rules = {}
    
    if (selectedRetentionRisks.length > 0) {
      rules.retentionRisk = selectedRetentionRisks
    }
    
    if (selectedStatuses.length > 0) {
      rules.status = selectedStatuses
    }
    
    if (minTotalGifts || maxTotalGifts) {
      rules.giftCountRange = {}
      if (minTotalGifts) rules.giftCountRange.min = parseInt(minTotalGifts)
      if (maxTotalGifts) rules.giftCountRange.max = parseInt(maxTotalGifts)
    }
    
    if (minTotalAmount || maxTotalAmount) {
      rules.totalGiftAmountRange = {}
      if (minTotalAmount) rules.totalGiftAmountRange.min = parseFloat(minTotalAmount)
      if (maxTotalAmount) rules.totalGiftAmountRange.max = parseFloat(maxTotalAmount)
    }
    
    return rules
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Please enter a segment name')
      return
    }
    
    const rules = buildRules()
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      rules,
    })
  }

  const toggleRetentionRisk = (value) => {
    setSelectedRetentionRisks(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const toggleStatus = (value) => {
    setSelectedStatuses(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Segment Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Major Donors, Lapsed Donors"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this segment represent?"
            rows={3}
          />
        </div>
      </div>

      {/* Retention Risk Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Retention Risk</label>
        <div className="flex flex-wrap gap-2">
          {RETENTION_RISK_OPTIONS.map(option => (
            <Badge
              key={option.value}
              variant={selectedRetentionRisks.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleRetentionRisk(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Donor Status Filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Donor Status</label>
        <div className="flex flex-wrap gap-2">
          {DONOR_STATUS_OPTIONS.map(option => (
            <Badge
              key={option.value}
              variant={selectedStatuses.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Gift Count Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Number of Gifts</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              min="0"
              value={minTotalGifts}
              onChange={(e) => setMinTotalGifts(e.target.value)}
              placeholder="Min"
            />
          </div>
          <div>
            <Input
              type="number"
              min="0"
              value={maxTotalGifts}
              onChange={(e) => setMaxTotalGifts(e.target.value)}
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Gift Amount Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Total Gift Amount ($)</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={minTotalAmount}
              onChange={(e) => setMinTotalAmount(e.target.value)}
              placeholder="Min"
            />
          </div>
          <div>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={maxTotalAmount}
              onChange={(e) => setMaxTotalAmount(e.target.value)}
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : segment ? 'Update Segment' : 'Create Segment'}
        </Button>
      </div>
    </form>
  )
}
