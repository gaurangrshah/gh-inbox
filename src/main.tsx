/**
 * Application entry point
 * Sets up React, routing, and global providers
 * Initializes auth from secure storage (Tauri keychain or localStorage)
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import { useAuthStore } from './stores/authStore'
import './index.css'

// Configure TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

// DEV: Clear localStorage to force fresh state (temporary debug)
// Remove this after fixing the caching issue
if (import.meta.env.DEV) {
  console.log('[DEBUG] Clearing localStorage for fresh state')
  localStorage.removeItem('github-inbox-filters')
  localStorage.removeItem('github-inbox-ui')
}

// Initialize auth from secure storage on app startup
// In Tauri: loads token from OS keychain (async)
// In browser: uses persisted localStorage state
// Note: This is async but the App component waits for isInitialized before rendering protected routes
void useAuthStore.getState().initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
