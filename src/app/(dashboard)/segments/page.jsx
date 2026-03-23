"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useSegments } from '@/hooks/use-segments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Segments page
export default function SegmentsPage() {
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { segments, loading, refetch } = useSegments(1, 50, { search })

  const segmentToDelete = segments?.find(s => s.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/segments/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        refetch()
        setDeleteId(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete segment')
      }
    } catch (error) {
      alert('Failed to delete segment')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Segments</h1>
          <p className="text-gray-400 mt-2">Group donors by behavior for targeting and workflows.</p>
        </div>
        <Link href="/segments/new">
          <Button>+ New Segment</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input placeholder="Search segments" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <div>Loading segments...</div>}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {segments?.length ? (
            segments.map((segment) => (
              <Card key={segment.id} className="h-full transition-all duration-200 hover:shadow-xl hover:border-primary/30 relative group">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <Link
                    href={`/segments/${segment.id}/edit`}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    title="Edit segment"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(segment.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete segment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link href={`/segments/${segment.id}`} className="block">
                  <CardHeader>
                    <CardTitle className="pr-16">{segment.name}</CardTitle>
                    <p className="text-sm text-gray-400">{segment.description || 'No description'}</p>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-300">
                    Members: {segment.memberCount ?? '—'}
                  </CardContent>
                </Link>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-600">No segments found.</p>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Segment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete "{segmentToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}