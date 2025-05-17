
import * as React from "react"
import { X } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast as useToastOriginalImport, toast as toastOriginal } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToastOriginalImport()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="p-4" />
    </ToastProvider>
  )
}

// Reexportamos para usar em outros componentes
export const useToast = useToastOriginalImport;
export const toast = toastOriginal;
