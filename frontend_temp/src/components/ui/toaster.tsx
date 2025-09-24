"use client"

import * as React from "react"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToasterProps = {
  toasts: ToasterToast[]
}

export function Toaster({ toasts }: ToasterProps) {
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          {action}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

// Re-export the Toast component and related utilities
export * from "./toast"
// Export the useToast hook
export { useToast } from "./use-toast"
