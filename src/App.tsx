/**
 * Root application component
 *
 * Sets up routing, authentication, and application layout.
 * Uses PAT-only authentication (OAuth removed for security).
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import InboxPage from './pages/InboxPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import { Layout } from './components/layout/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useAuthStore } from './stores/authStore'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
})

/**
 * Protected route wrapper - redirects to login if not authenticated
 * Waits for auth initialization before rendering (important for Tauri keychain)
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const token = useAuthStore((state) => state.token)

  // Wait for auth initialization (especially important in Tauri where token comes from keychain)
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#0d1117' }}>
        <div className="text-[#8b949e]">Loading...</div>
      </div>
    )
  }

  // Must have both isAuthenticated AND a valid token
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

/**
 * Root application component
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <InboxPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 handler */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
