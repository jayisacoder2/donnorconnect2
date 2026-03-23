"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useWorkflows } from '@/hooks/use-workflows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

// Workflows page
export default function WorkflowsPage() {
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const { workflows, loading, refetch } = useWorkflows(1, 50, {})

  const workflowToDelete = workflows?.find(w => w.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/workflows/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        refetch()
        setDeleteId(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete workflow')
      }
    } catch (error) {
      alert('Failed to delete workflow')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-gray-400 mt-2">Automate follow-ups and donor journeys.</p>
        </div>
        <Link href="/workflows/new">
          <Button>+ New Workflow</Button>
        </Link>
      </div>

      {loading && <div>Loading workflows...</div>}

      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workflows?.length ? (
            workflows.map((wf) => (
              <Card key={wf.id} className="h-full transition-all duration-200 hover:shadow-xl hover:border-primary/30 relative group">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                  <Link
                    href={`/workflows/${wf.id}/edit`}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                    title="Edit workflow"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteId(wf.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    title="Delete workflow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link href={`/workflows/${wf.id}`} className="block">
                  <CardHeader>
                    <div className="flex items-center gap-2 pr-16">
                      <CardTitle>{wf.name}</CardTitle>
                      <span className={`text-xs font-medium rounded px-2 py-1 ${
                        wf.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-slate-700 text-gray-300'
                      }`}>
                        {wf.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{wf.description || 'No description'}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-300">
                    <p><span className="font-medium text-white">Trigger:</span> {wf.trigger.replace(/_/g, ' ')}</p>
                    <p><span className="font-medium text-white">Steps:</span> {Array.isArray(wf.steps) ? wf.steps.length : 0}</p>
                    <p><span className="font-medium text-white">Executions:</span> {wf.executionCount || 0}</p>
                  </CardContent>
                </Link>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-300">No workflows found. Click "New Workflow" to create one.</p>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-gray-900">Delete Workflow</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete "{workflowToDelete?.name}"? This action cannot be undone.
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