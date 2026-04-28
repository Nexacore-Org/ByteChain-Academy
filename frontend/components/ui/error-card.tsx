"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorCardProps {
  message: string
  onRetry?: () => void
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-red-400 text-center">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
