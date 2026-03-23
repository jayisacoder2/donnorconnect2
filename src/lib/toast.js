/**
 * Toast Utility Component
 */

import { useState, useEffect, useRef } from 'react'

const TOAST_DURATION = 4000

export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const addToast = (variant, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, variant, message }])

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION)
    timers.current.set(id, timer)
  }

  const dismissToast = (id) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer))
    timers.current.clear()
  }, [])

  const toast = {
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    info: (message) => addToast('info', message),
    warning: (message) => addToast('warning', message),
  }

  return { toast, toasts, dismissToast }
}

export function Toaster({ toasts = [], onDismiss }) {
  const variantStyles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    default: 'border-slate-200 bg-white text-slate-900',
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant] || variantStyles.default
        return (
          <div
            key={toast.id}
            className={`rounded border px-3 py-2 shadow-sm transition ${style}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm">{toast.message}</span>
              {onDismiss && (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800"
                  onClick={() => onDismiss(toast.id)}
                  aria-label="Close toast"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Example usage:
// const { toast, toasts, dismissToast } = useToast()
// <Toaster toasts={toasts} onDismiss={dismissToast} />
// toast.success('Donor created successfully!')
// toast.error('Failed to save donor')
// toast.info('Processing donation...')
// toast.warning('Duplicate email detected')