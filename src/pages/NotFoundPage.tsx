/**
 * 404 Not Found page component
 */

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gh-bg-primary">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gh-text-primary mb-4">404</h1>
        <p className="text-gh-text-secondary mb-6">Page not found</p>
        <Link to="/" className="btn btn-primary">
          Go to Inbox
        </Link>
      </div>
    </div>
  )
}
