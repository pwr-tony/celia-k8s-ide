import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'h-5 min-w-5 px-1.5 text-[11px] font-medium',
        'bg-bg-tertiary text-text-secondary',
        'border border-border-subtle rounded',
        'shadow-[0_1px_0_0_rgba(0,0,0,0.4)]',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
