"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleClick = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleClick}
      className={cn(
        "peer h-6 w-6 shrink-0 rounded border-[3px] border-gray-700 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary hover:shadow-md hover:scale-110",
        checked ? "bg-primary border-primary text-primary-foreground shadow-sm" : "bg-white shadow-inner",
        className
      )}
      {...props}
    >
      {checked && (
        <Check className="h-5 w-5 font-bold" strokeWidth={4} />
      )}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
