/**
 * Donor Status Badge Component
 */

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function DonorStatusBadge({ status, className }) {
  const statusVariants = {
    ACTIVE: {
      label: 'Active',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    LAPSED: {
      label: 'Lapsed',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    INACTIVE: {
      label: 'Inactive',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    DO_NOT_CONTACT: {
      label: 'Do Not Contact',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }

  const variant = statusVariants[status] || {
    label: 'Unknown',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  )
}

// TODO: Example usage:
// <DonorStatusBadge status="ACTIVE" />
// <DonorStatusBadge status="LAPSED" className="ml-2" />