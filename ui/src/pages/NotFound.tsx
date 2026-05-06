import { useNavigate } from 'react-router'
import { Button } from '@/components/primitives'
import { Home } from 'lucide-react'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex h-screen items-center justify-center bg-bg-primary">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <p className="text-text-secondary mb-8">Page not found</p>
        <Button onClick={() => navigate('/')}>
          <Home className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
