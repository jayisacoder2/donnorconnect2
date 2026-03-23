/**
 * Donation List Component
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

export function DonationList({ donations = [], onEdit, onDelete, isLoading }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6}>Loading donations...</TableCell>
            </TableRow>
          )}
          {!isLoading && donations.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>No donations found.</TableCell>
            </TableRow>
          )}
          {!isLoading &&
            donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>{formatDate(donation.date)}</TableCell>
                <TableCell>
                  {donation.donor
                    ? `${donation.donor.firstName} ${donation.donor.lastName}`
                    : donation.donorId}
                </TableCell>
                <TableCell>{formatCurrency(donation.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{donation.type || 'ONE_TIME'}</Badge>
                </TableCell>
                <TableCell>{donation.campaign?.name || '—'}</TableCell>
                <TableCell className="space-x-2">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(donation)}>
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(donation)}>
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}