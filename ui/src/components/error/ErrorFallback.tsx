import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react'
import { Button } from '@/components/primitives'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/router/routes'

interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
  title?: string
  description?: string
}

export function ErrorFallback({
  error,
  onReset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. You can try again or go back to the dashboard.',
}: ErrorFallbackProps) {
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyError = async () => {
    if (!error) return
    const errorText = `Error: ${error.message}\n\nStack:\n${error.stack || 'No stack trace available'}`
    await navigator.clipboard.writeText(errorText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGoHome = () => {
    navigate(ROUTES.DASHBOARD)
    onReset?.()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="h-16 w-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>

      <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary max-w-md mb-6">{description}</p>

      <div className="flex items-center gap-3 mb-6">
        {onReset && (
          <Button variant="primary" onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        )}
        <Button variant="secondary" onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>

      {error && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors mx-auto"
          >
            <Bug className="h-4 w-4" />
            {showDetails ? 'Hide' : 'Show'} error details
          </button>

          {showDetails && (
            <div className="mt-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary uppercase tracking-wider">Error Details</span>
                <Button variant="ghost" size="sm" onClick={handleCopyError}>
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-bg-tertiary border border-border-subtle rounded-lg p-4 overflow-auto max-h-48">
                <p className="text-sm font-medium text-error mb-2">{error.message}</p>
                {error.stack && (
                  <pre className="text-xs text-text-tertiary font-mono whitespace-pre-wrap break-all">
                    {error.stack}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PageErrorProps {
  error: Error | null
  onRetry?: () => void
}

export function PageError({ error, onRetry }: PageErrorProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <ErrorFallback
        error={error}
        onReset={onRetry}
        title="Failed to load page"
        description="We couldn't load this page. Check your connection and try again."
      />
    </div>
  )
}

interface InlineErrorProps {
  message: string
  onRetry?: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
      <AlertTriangle className="h-5 w-5 text-error shrink-0" />
      <span className="text-sm text-error">{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  )
}
