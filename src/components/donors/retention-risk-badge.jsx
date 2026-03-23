/**
 * Retention Risk Badge Component
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function RetentionRiskBadge({ risk, className }) {
  const riskVariants = {
    LOW: { label: 'Low Risk', className: 'bg-green-100 text-green-800 border-green-200' },
    MEDIUM: { label: 'Medium Risk', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    HIGH: { label: 'High Risk', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200' },
    UNKNOWN: { label: 'Unknown', className: 'bg-slate-100 text-slate-800 border-slate-200' },
  }

  const variant = riskVariants[risk] || riskVariants.UNKNOWN

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  )
}

// Example usage:
// <RetentionRiskBadge risk="LOW" />
// <RetentionRiskBadge risk="HIGH" className="ml-2" />