"use client"
import Link from 'next/link'
import { useState } from 'react'
import { useCampaigns } from '@/hooks/use-campaigns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignStatusBadge } from '@/components/campaigns/campaign-status-badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Campaigns list page
export default function CampaignsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { campaigns, loading, refetch } = useCampaigns(1, 50, {
    search,
    status: status || undefined,
  })

  const campaignToDelete = campaigns?.find(c => c.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/campaigns/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        refetch()
        setDeleteId(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete campaign')
      }
    } catch (error) {
      alert('Failed to delete campaign')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-gray-400 mt-2">Track fundraising initiatives and progress</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="shadow-sm">
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          placeholder="Search campaigns"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-gray-400 transition-all duration-200 hover:border-purple-500/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none cursor-pointer" 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {loading && <div>Loading campaigns...</div>}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns?.length ? (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="h-full transition-all duration-200 hover:shadow-xl hover:border-primary/30 relative group">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <Link
                    href={`/campaigns/${campaign.id}/edit`}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    title="Edit campaign"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(campaign.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link href={`/campaigns/${campaign.id}`} className="block">
                  <CardHeader>
                    <div className="flex items-center gap-2 flex-wrap pr-16">
                      <CardTitle>{campaign.name}</CardTitle>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                    <p className="text-sm text-gray-400">{campaign.description || 'No description'}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <p>
                      <span className="font-medium text-white">Goal:</span> {campaign.goal ? formatCurrency(campaign.goal) : '—'}
                    </p>
                    <p>
                      <span className="font-medium text-white">Start:</span> {campaign.startDate ? formatDate(campaign.startDate) : '—'}
                    </p>
                    <p>
                      <span className="font-medium text-white">End:</span> {campaign.endDate ? formatDate(campaign.endDate) : '—'}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-400">No campaigns found.</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Campaign</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete <strong>{campaignToDelete?.name}</strong>? 
              This will NOT delete donations linked to this campaign, but they will no longer be associated with any campaign.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}