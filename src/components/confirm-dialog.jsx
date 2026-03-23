/**
 * Confirm Dialog Component - Reusable confirmation dialog
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "destructive" 
}) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm?.()
    } finally {
      setLoading(false)
      onClose?.()
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Working...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example usage:
// <ConfirmDialog
//   isOpen={showDeleteDialog}
//   onClose={() => setShowDeleteDialog(false)}
//   onConfirm={handleDeleteDonor}
//   title="Delete Donor"
//   description="Are you sure you want to delete this donor? This action cannot be undone."
//   confirmText="Delete"
//   variant="destructive"
// />