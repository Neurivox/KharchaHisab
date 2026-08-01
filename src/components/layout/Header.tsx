import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function Header({ title, subtitle, action, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 pb-4 safe-header">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  )
}
