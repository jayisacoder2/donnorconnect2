"use client"

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, ArrowLeft, Users, DollarSign, Calendar } from 'lucide-react'

export default function SegmentDetailPage({ params }) {
  const { id: segmentId } = use(params)
  const [segment, setSegment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSegment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/segments/${segmentId}`)
      if (!res.ok) throw new Error('Failed to load segment')
      const data = await res.json()
      setSegment(data.segment || null)
    } catch (err) {
      setError('Unable to load segment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSegment()
  }, [segmentId])

  if (loading) return <div>Loading segment...</div>
  if (error || !segment) return <div>{error || 'Segment not found.'}</div>

  const getRiskVariant = (risk) => {
    switch (risk) {
      case 'LOW': return 'default'
      case 'MEDIUM': return 'secondary'
      case 'HIGH': return 'destructive'
      case 'CRITICAL': return 'destructive'
      default: return 'outline'
    }
  }

  const renderRuleSummary = (rules) => {
    if (!rules || Object.keys(rules).length === 0) {
      return <p className="text-gray-400 text-sm">No rules defined</p>
    }

    const parts = []
    
    if (rules.retentionRisk?.length) {
      parts.push({ label: 'Risk', value: rules.retentionRisk.join(', ') })
    }
    if (rules.status?.length) {
      parts.push({ label: 'Status', value: rules.status.join(', ') })
    }
    
    const giftRange = rules.giftCountRange
    if (giftRange) {
      const min = giftRange.min !== undefined ? `≥${giftRange.min}` : ''
      const max = giftRange.max !== undefined ? `≤${giftRange.max}` : ''
      if (min || max) parts.push({ label: 'Gifts', value: `${min}${min && max ? ' and ' : ''}${max}` })
    }
    
    const amountRange = rules.totalGiftAmountRange
    if (amountRange) {
      const min = amountRange.min !== undefined ? `≥$${amountRange.min}` : ''
      const max = amountRange.max !== undefined ? `≤$${amountRange.max}` : ''
      if (min || max) parts.push({ label: 'Amount', value: `${min}${min && max ? ' and ' : ''}${max}` })
    }

    return (
      <div className="flex flex-wrap gap-2">
        {parts.map((part, i) => (
          <Badge key={i} variant="outline">
            <span className="font-medium">{part.label}:</span> {part.value}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/segments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{segment.name}</h1>
            {segment.description && (
              <p className="text-gray-400 mt-1">{segment.description}</p>
            )}
          </div>
        </div>
        <Link href={`/segments/${segmentId}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Segment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">Members</p>
            <p className="text-2xl font-bold">{segment.memberCount ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Rules</p>
            {renderRuleSummary(segment.rules)}
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Donors in this Segment ({segment.donors?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!segment.donors || segment.donors.length === 0) ? (
            <p className="text-gray-400 text-center py-8">No donors match this segment's criteria.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Total Gifts</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Last Gift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segment.donors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell>
                      <Link 
                        href={`/donors/${donor.id}`}
                        className="font-medium text-blue-400 hover:text-blue-300"
                      >
                        {donor.firstName} {donor.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-400">{donor.email || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={donor.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {donor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskVariant(donor.retentionRisk)}>
                        {donor.retentionRisk}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{donor.totalGifts}</TableCell>
                    <TableCell className="text-right">
                      ${(donor.totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {donor.lastGiftDate 
                        ? new Date(donor.lastGiftDate).toLocaleDateString() 
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
