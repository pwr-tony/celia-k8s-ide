import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorFallback } from './ErrorFallback'
import type { ReactNode } from 'react'

interface QueryErrorBoundaryProps {
  children: ReactNode
}

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={
            <ErrorFallback
              error={null}
              onReset={reset}
              title="Failed to load data"
              description="There was a problem loading the data. Please try again."
            />
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
