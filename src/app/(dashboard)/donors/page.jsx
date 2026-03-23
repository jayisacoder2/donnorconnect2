"use client"

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DonorStatusBadge } from '@/components/donors/donor-status-badge'
import { RetentionRiskBadge } from '@/components/donors/retention-risk-badge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDonors } from '@/hooks/use-donors'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Users, Search, ChevronRight, Trash2 } from 'lucide-react'

export default function DonorsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [risk, setRisk] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { donors, pagination, loading, error, refetch } = useDonors(page, 10, {
    search,
    status: status || undefined,
    retentionRisk: risk || undefined,
    sortBy,
    sortOrder,
  })

  // Delete donor state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [donorToDelete, setDonorToDelete] = useState(null)

  const handleDeleteClick = (e, donor) => {
    e.stopPropagation()
    setDonorToDelete(donor)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!donorToDelete) return
    const res = await fetch(`/api/donors/${donorToDelete.id}`, { method: 'DELETE' })
    if (res.ok) {
      refetch()
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const sortedDonors = useMemo(() => donors || [], [donors])

  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.limit || 10)))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="h-10 w-10 text-purple-400" />
              Donor Gallery
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Manage your donor relationships and track engagement
            </p>
          </div>
          <Link href="/donors/new">
            <Button className="btn-gradient rounded-xl px-5 py-3">
              <Plus className="mr-2 h-5 w-5" />
              Add Donor
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="dark-input pl-10"
          />
        </div>
        <select
          className="dark-select"
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LAPSED">Lapsed</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DO_NOT_CONTACT">Do Not Contact</option>
        </select>
        <select
          className="dark-select"
          value={risk}
          onChange={(e) => {
            setPage(1)
            setRisk(e.target.value)
          }}
        >
          <option value="">All Risks</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
        <select
          className="dark-select"
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => {
            const [field, dir] = e.target.value.split(':')
            setSortBy(field)
            setSortOrder(dir)
            setPage(1)
          }}
        >
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="firstName:asc">Name (A→Z)</option>
          <option value="firstName:desc">Name (Z→A)</option>
          <option value="email:asc">Email (A→Z)</option>
          <option value="email:desc">Email (Z→A)</option>
          <option value="totalAmount:desc">Total Raised (High→Low)</option>
          <option value="totalAmount:asc">Total Raised (Low→High)</option>
        </select>
      </div>

      {/* Donors Table */}
      <div className="dark-table">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-white/10">
              <TableHead className="cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => handleSort('firstName')}>
                Name
              </TableHead>
              <TableHead className="cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => handleSort('email')}>
                Email
              </TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Risk</TableHead>
              <TableHead className="cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => handleSort('totalAmount')}>
                Lifetime Value
              </TableHead>
              <TableHead className="text-gray-400">Last Gift</TableHead>
              <TableHead className="text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                    Loading donors...
                  </div>
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-red-400">
                    <p className="font-medium">Unable to load donors</p>
                    <p className="text-sm text-gray-500 mt-1">{error.message}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && !error && sortedDonors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">No donors found.</TableCell>
              </TableRow>
            )}
            {!loading && !error &&
              sortedDonors.map((donor) => (
                <TableRow 
                  key={donor.id} 
                  className="border-b border-white/5 hover:bg-purple-500/10 transition-all duration-200 cursor-pointer group"
                  onClick={() => router.push(`/donors/${donor.id}`)}
                >
                  <TableCell className="font-medium text-white group-hover:text-purple-400 transition-colors">
                    {donor.firstName} {donor.lastName}
                  </TableCell>
                  <TableCell className="text-gray-400">{donor.email}</TableCell>
                  <TableCell>
                    <DonorStatusBadge status={donor.status} />
                  </TableCell>
                  <TableCell>
                    <RetentionRiskBadge risk={donor.retentionRisk} />
                  </TableCell>
                  <TableCell className="text-emerald-400 font-semibold">{formatCurrency(donor.totalAmount || 0)}</TableCell>
                  <TableCell className="text-gray-400">{donor.lastGiftDate ? formatDate(donor.lastGiftDate) : '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/donors/${donor.id}/edit`} 
                        className="text-sm text-gray-400 font-medium hover:text-white transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDeleteClick(e, donor)}
                        className="text-sm text-gray-400 hover:text-red-400 transition-all p-1"
                        title="Delete donor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            disabled={page <= 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDonorToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Donor"
        description={donorToDelete ? `Are you sure you want to delete ${donorToDelete.firstName} ${donorToDelete.lastName}? This will also remove all their donation history and cannot be undone.` : ''}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}