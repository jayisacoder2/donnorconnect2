/**
 * Campaign Status Badge Component
 * TODO: Implement status badge for campaign states
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CampaignStatusBadge({ status, className }) {
  const statusVariants = {
    DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' },
    COMPLETED: { label: 'Completed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-800 border-slate-200' },
  }

  const variant = statusVariants[status] || {
    label: status || 'Unknown',
    className: 'bg-muted text-foreground border-border',
  }

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  )
}

// Example usage:
// <CampaignStatusBadge status="ACTIVE" />
// <CampaignStatusBadge status="DRAFT" className="ml-2" />