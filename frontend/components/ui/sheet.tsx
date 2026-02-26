"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetContextValue {
  open: boolean
  onClose: () => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(
  undefined
)

export interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Sheet({ open, onClose, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onClose }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({
  onClick,
  children,
  className,
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

export function SheetContent({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  const ctx = React.useContext(SheetContext)
  if (!ctx) throw new Error("SheetContent must be used within Sheet")
  const { open, onClose } = ctx

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sheet-title" : undefined}
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-xl flex flex-col",
          "animate-in slide-in-from-right duration-200",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 id="sheet-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  )
}
