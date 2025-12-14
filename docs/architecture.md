# GitHub Inbox - Technical Architecture

**Project:** GitHub Notifications Inbox
**Version:** 1.0.0
**Created:** 2025-12-13
**Tech Stack:** React 18 + Vite + TypeScript + Tailwind CSS

## Overview

A high-performance, desktop-focused GitHub notifications management application that treats notifications as an "inbox zero" workflow. Built with modern React patterns, optimized for speed and keyboard-driven navigation.

## Design Principles

1. **Performance First:** Sub-100ms interactions, virtualized lists, optimistic updates
2. **Keyboard-Centric:** All actions accessible via shortcuts
3. **Dark by Default:** Dark mode as primary experience
4. **Inbox Zero Workflow:** Archive pattern, batch operations, smart filtering
5. **Type Safety:** Strict TypeScript throughout
6. **Offline Resilient:** Local state persistence, graceful degradation

## Tech Stack Rationale

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React 18** | UI Framework | Concurrent rendering, automatic batching |
| **Vite** | Build Tool | Lightning-fast HMR, optimized production builds |
| **TypeScript** | Type Safety | Catch errors at compile time, better DX |
| **Zustand** | Global State | Minimal boilerplate, no provider hell |
| **TanStack Query** | Server State | Caching, background sync, request deduplication |
| **Tailwind CSS** | Styling | Rapid development, consistent design system |
| **react-router-dom** | Routing | Standard routing solution |
| **@tanstack/react-virtual** | Virtualization | Handle 1000+ notification lists efficiently |
| **lucide-react** | Icons | Lightweight, tree-shakeable, consistent design |
| **date-fns** | Date Handling | Lightweight alternative to moment.js |

## Project Structure

```
github-inbox - webgen/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── AppLayout.tsx    # Main app container
│   │   │   ├── Header.tsx       # Top navigation
│   │   │   ├── Sidebar.tsx      # Filter sidebar
│   │   │   └── CommandPalette.tsx
│   │   └── notifications/       # Feature components
│   │       ├── NotificationList.tsx
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationDetail.tsx
│   │       ├── FilterPanel.tsx
│   │       ├── GroupHeader.tsx
│   │       └── BulkActions.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useKeyboard.ts       # Keyboard navigation
│   │   ├── useNotifications.ts  # Notification queries
│   │   ├── useFilters.ts        # Filter logic
│   │   ├── useVirtualization.ts # List virtualization wrapper
│   │   └── useLocalStorage.ts   # Persist preferences
│   ├── lib/                     # Utilities and core logic
│   │   ├── api/
│   │   │   ├── client.ts        # Axios/fetch wrapper
│   │   │   ├── github.ts        # GitHub API methods
│   │   │   ├── rate-limit.ts    # Rate limit handling
│   │   │   └── cache.ts         # ETag caching logic
│   │   ├── utils/
│   │   │   ├── notifications.ts # Notification helpers
│   │   │   ├── keyboard.ts      # Keyboard shortcut registry
│   │   │   ├── grouping.ts      # Grouping algorithms
│   │   │   └── formatting.ts    # Date/text formatting
│   │   └── constants.ts         # App-wide constants
│   ├── pages/                   # Route pages
│   │   ├── InboxPage.tsx        # Main inbox view
│   │   ├── LoginPage.tsx        # OAuth login
│   │   ├── SettingsPage.tsx     # User preferences
│   │   └── NotFoundPage.tsx     # 404 handler
│   ├── stores/                  # Zustand state stores
│   │   ├── authStore.ts         # Authentication state
│   │   ├── filterStore.ts       # Filter & grouping state
│   │   └── uiStore.ts           # UI preferences (sidebar collapsed, etc.)
│   ├── types/                   # TypeScript type definitions
│   │   ├── github.ts            # GitHub API types
│   │   ├── notification.ts      # Internal notification types
│   │   └── index.ts             # Barrel export
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── docs/
│   ├── architecture.md          # This file
│   ├── design-decisions.md
│   └── screenshots/
├── research/
│   └── competitive-analysis.md
├── .env.example                 # Environment variables template
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## State Architecture

### 1. Authentication Store (Zustand)

**Purpose:** Manage user authentication and GitHub token

```typescript
interface AuthState {
  token: string | null;
  user: GitHubUser | null;
  isAuthenticated: boolean;

  // Actions
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
```

**Persistence:** localStorage via Zustand persist middleware

### 2. Filter Store (Zustand)

**Purpose:** Track active filters and grouping preferences

```typescript
interface FilterState {
  // Filters
  selectedRepos: string[];
  selectedReasons: NotificationReason[];
  showUnreadOnly: boolean;
  showParticipating: boolean;

  // Grouping
  groupBy: 'none' | 'repo' | 'date' | 'reason';
  sortOrder: 'newest' | 'oldest' | 'updated';

  // Actions
  setRepoFilter: (repos: string[]) => void;
  setReasonFilter: (reasons: NotificationReason[]) => void;
  toggleUnreadOnly: () => void;
  setGroupBy: (groupBy: GroupByOption) => void;
  resetFilters: () => void;
}
```

**Persistence:** localStorage for user preferences

### 3. UI Store (Zustand)

**Purpose:** UI state and preferences

```typescript
interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  selectedNotificationId: string | null;

  // Actions
  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  selectNotification: (id: string | null) => void;
}
```

### 4. Notification Data (TanStack Query)

**Purpose:** Server state management with caching and background sync

**Query Keys:**
```typescript
const queryKeys = {
  notifications: ['notifications'] as const,
  notificationsList: (filters: FilterParams) =>
    ['notifications', 'list', filters] as const,
  notificationDetail: (id: string) =>
    ['notifications', 'detail', id] as const,
  repos: ['repos'] as const,
};
```

**Queries:**
- `useNotificationsQuery` - Fetch and cache notifications list
- `useNotificationDetailQuery` - Fetch single notification thread
- `useReposQuery` - Fetch user's repositories for filtering

**Mutations:**
- `useMarkAsReadMutation` - Mark notification(s) as read
- `useArchiveMutation` - Archive (delete) notification(s)
- `useMarkRepoAsReadMutation` - Mark entire repo as read

**Caching Strategy:**
- Stale time: 30 seconds
- Cache time: 5 minutes
- Refetch on window focus
- Background polling: 60 seconds (when tab active)
- Optimistic updates for mutations

## API Integration

### GitHub REST API Client

**Base Configuration:**
```typescript
const apiClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
});

// Interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `token ${token}`;
  }
  return config;
});
```

### Rate Limit Handling

GitHub API allows 5,000 requests/hour for authenticated users.

**Strategy:**
1. Track rate limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`)
2. Show warning at 10% remaining
3. Implement exponential backoff on 403 responses
4. Queue requests when near limit

```typescript
interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: Date;
}

const rateLimitInterceptor = (response: AxiosResponse) => {
  const remaining = parseInt(response.headers['x-ratelimit-remaining']);
  const limit = parseInt(response.headers['x-ratelimit-limit']);
  const resetAt = new Date(
    parseInt(response.headers['x-ratelimit-reset']) * 1000
  );

  updateRateLimitInfo({ remaining, limit, resetAt });

  if (remaining < limit * 0.1) {
    showRateLimitWarning();
  }

  return response;
};
```

### ETag Caching

GitHub supports conditional requests via ETags for efficient polling.

**Implementation:**
```typescript
const etagCache = new Map<string, string>();

const conditionalRequest = async (url: string) => {
  const etag = etagCache.get(url);
  const response = await apiClient.get(url, {
    headers: etag ? { 'If-None-Match': etag } : {},
  });

  if (response.status === 304) {
    // Not modified - use cached data
    return cachedData;
  }

  // Update ETag cache
  etagCache.set(url, response.headers.etag);
  return response.data;
};
```

### Error Handling

**Error Boundary Pattern:**
```typescript
class APIError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Error categories
- 401: Redirect to login
- 403: Rate limit (queue) or permissions (show error)
- 404: Resource not found
- 5xx: Retry with exponential backoff
```

## Component Architecture

### Component Tree

```
App
├── Router
│   ├── LoginPage
│   └── ProtectedRoute
│       └── AppLayout
│           ├── Header
│           │   ├── SearchBar
│           │   ├── RefreshButton
│           │   └── UserMenu
│           ├── Sidebar
│           │   ├── FilterPanel
│           │   │   ├── RepoFilter
│           │   │   ├── ReasonFilter
│           │   │   └── GroupBySelector
│           │   └── QuickFilters
│           └── MainContent
│               ├── InboxPage
│               │   ├── NotificationList (virtualized)
│               │   │   ├── GroupHeader (if grouped)
│               │   │   └── NotificationItem[]
│               │   └── NotificationDetail (side panel)
│               └── SettingsPage
└── CommandPalette (global)
```

### Key Component Responsibilities

**NotificationList:**
- Virtualize 1000+ items with `@tanstack/react-virtual`
- Handle grouping logic
- Manage selection state
- Dispatch keyboard events to items

**NotificationItem:**
- Display notification metadata
- Handle click/keyboard selection
- Show unread indicator
- Optimistic UI updates

**FilterSidebar:**
- Persist filter state to Zustand
- Show active filters count
- Quick filter presets (Unread, Participating, etc.)

**Header:**
- Global actions (Refresh, Mark all as read)
- Command palette trigger
- User profile dropdown

**CommandPalette:**
- Fuzzy search through notifications
- Quick actions via keyboard
- Recent commands history

## Keyboard Navigation Architecture

### Global Keyboard Event System

**Architecture:**
```typescript
// Keyboard shortcut registry
interface Shortcut {
  key: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  handler: (event: KeyboardEvent) => void;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { key: 'k', modifiers: ['ctrl'], handler: openCommandPalette,
    description: 'Open command palette', category: 'Global' },
  { key: 'j', handler: selectNext,
    description: 'Next notification', category: 'Navigation' },
  { key: 'k', handler: selectPrevious,
    description: 'Previous notification', category: 'Navigation' },
  { key: 'e', handler: archiveSelected,
    description: 'Archive', category: 'Actions' },
  { key: 'r', handler: markAsRead,
    description: 'Mark as read', category: 'Actions' },
  // ... more shortcuts
];
```

**Implementation:**
```typescript
// Global listener at App level
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const matchedShortcut = shortcuts.find(shortcut =>
      shortcut.key === event.key &&
      checkModifiers(event, shortcut.modifiers)
    );

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.handler(event);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Focus Management

**Strategy:**
1. Use `tabIndex` for keyboard navigation
2. `focus-visible` for keyboard-only focus styles
3. Focus trap in modals (Command Palette)
4. Restore focus after actions

**Accessibility:**
- All interactive elements keyboard accessible
- ARIA labels for icon-only buttons
- Live regions for dynamic updates
- Skip links for main content

## Performance Optimizations

### 1. List Virtualization

**Implementation:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const NotificationList = ({ notifications }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 extra items above/below
  });

  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <NotificationItem
            key={notifications[virtualRow.index].id}
            notification={notifications[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

### 2. Optimistic Updates

**Pattern:**
```typescript
const markAsReadMutation = useMutation({
  mutationFn: (notificationId: string) =>
    api.markAsRead(notificationId),
  onMutate: async (notificationId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['notifications'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['notifications']);

    // Optimistically update UI
    queryClient.setQueryData(['notifications'], (old) =>
      old.map(n => n.id === notificationId
        ? { ...n, unread: false }
        : n
      )
    );

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['notifications'], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  },
});
```

### 3. Code Splitting

**Route-based splitting:**
```typescript
import { lazy, Suspense } from 'react';

const InboxPage = lazy(() => import('./pages/InboxPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// In router
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<InboxPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</Suspense>
```

## Styling System

### Tailwind Configuration

**Custom theme extending Tailwind:**
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub-inspired dark theme
        'gh-bg-primary': '#0d1117',
        'gh-bg-secondary': '#161b22',
        'gh-bg-tertiary': '#21262d',
        'gh-border': '#30363d',
        'gh-text-primary': '#c9d1d9',
        'gh-text-secondary': '#8b949e',
        'gh-accent': '#58a6ff',
        'gh-success': '#3fb950',
        'gh-danger': '#f85149',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
};
```

### Component Design Tokens

**Spacing:**
- Base unit: 4px
- Compact mode: 0.75x spacing
- Comfortable mode: 1x spacing (default)

**Typography:**
- Font: System font stack (San Francisco, Segoe UI, Roboto)
- Sizes: 12px (small), 14px (base), 16px (large), 20px (title)

**Interactive States:**
- Hover: 10% brightness increase
- Active: Background change
- Focus: 2px accent outline
- Disabled: 50% opacity

## Data Flow

### Notification Fetch Flow

```
1. User opens app
   ↓
2. AuthStore checks for token
   ↓
3. If authenticated → useNotificationsQuery runs
   ↓
4. TanStack Query checks cache
   ↓
5. If stale/missing → API call to GitHub
   ↓
6. Response updates cache
   ↓
7. Components re-render with new data
   ↓
8. Background polling starts (60s interval)
```

### Filter Application Flow

```
1. User changes filter (e.g., selects repo)
   ↓
2. FilterStore updates
   ↓
3. useNotificationsQuery hook observes filter change
   ↓
4. New query key generated with filters
   ↓
5. TanStack Query fetches with new parameters
   ↓
6. NotificationList re-renders with filtered data
```

### Archive (Mark as Done) Flow

```
1. User presses 'e' or clicks Archive
   ↓
2. useArchiveMutation called
   ↓
3. onMutate: Optimistic UI update (remove from list)
   ↓
4. API call: DELETE /notifications/threads/:id
   ↓
5. On success: Invalidate queries
   ↓
6. On error: Rollback optimistic update, show toast
```

## Security Considerations

### 1. Token Storage

**Strategy:** Store GitHub personal access token in localStorage (encrypted if possible)

**Risks:**
- XSS attacks can access localStorage
- Token has full GitHub API access

**Mitigations:**
- Strict Content Security Policy
- No inline scripts
- Sanitize all user input
- Regular security audits
- Token expiration handling
- Clear instructions for minimal token scopes

### 2. API Request Signing

All API requests include the token in Authorization header (never in URL).

### 3. CSP Headers

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://avatars.githubusercontent.com data:;
    connect-src 'self' https://api.github.com;
  ">
```

## Offline Support

### Progressive Enhancement

**Online:**
- Full functionality
- Real-time updates
- Background sync

**Offline:**
- Display cached notifications
- Queue actions for later sync
- Show offline indicator
- Prevent destructive actions

**Implementation:**
```typescript
// Detect online/offline
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);
```

## Testing Strategy

### Unit Tests
- Utility functions (grouping, filtering, formatting)
- Custom hooks (useKeyboard, useFilters)
- Store logic (Zustand actions)

### Integration Tests
- Component interactions
- API client with mocked responses
- Router navigation

### E2E Tests (Future)
- Full user workflows
- Keyboard navigation
- Error states

**Tools:** Vitest + React Testing Library

## Build and Deployment

### Development
```bash
npm run dev
# Vite dev server with HMR at http://localhost:5173
```

### Production Build
```bash
npm run build
# Output: dist/
# - Code splitting
# - Minification
# - Tree shaking
# - Asset optimization
```

### Environment Variables
```
VITE_GITHUB_CLIENT_ID=     # For OAuth flow (future)
VITE_API_BASE_URL=         # GitHub API URL
```

## Future Enhancements

**Phase 2:**
- OAuth flow (no manual token entry)
- Desktop notifications
- Multi-account support
- Custom notification sounds

**Phase 3:**
- Electron wrapper for native app
- System tray integration
- Global keyboard shortcuts
- Auto-updater

## Appendix: Type Definitions

### Core Types

```typescript
// GitHub API notification shape
interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: NotificationReason;
  updated_at: string;
  last_read_at: string | null;
  subject: {
    title: string;
    url: string;
    latest_comment_url: string;
    type: 'Issue' | 'PullRequest' | 'Commit' | 'Release';
  };
  repository: {
    id: number;
    full_name: string;
    name: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  };
}

// Internal notification type (enriched)
interface Notification extends GitHubNotification {
  groupKey?: string;
  selected?: boolean;
}

type NotificationReason =
  | 'assign'
  | 'author'
  | 'comment'
  | 'invitation'
  | 'manual'
  | 'mention'
  | 'review_requested'
  | 'security_alert'
  | 'state_change'
  | 'subscribed'
  | 'team_mention';
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-12-13
**Author:** webgen v1.4
