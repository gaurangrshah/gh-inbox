# GitHub Inbox

A modern, efficient GitHub notifications manager with real-time sync, keyboard shortcuts, and advanced filtering.

## Features

- **Real-time Notifications** - 60-second background sync with GitHub API
- **Keyboard Navigation** - vim-style shortcuts (j/k/x/o/r/Escape)
- **Advanced Filtering** - Filter by repository, reason, type, and status
- **Rate Limit Tracking** - Visual indicator with automatic retry
- **Dark Theme** - GitHub Primer design system dark theme
- **Virtualized Lists** - Smooth performance with @tanstack/react-virtual
- **Optimistic Updates** - Instant UI feedback with rollback on error
- **Inbox Zero Workflow** - Mark as read, unsubscribe, bulk operations

## Tech Stack

- **React 18** - UI framework with concurrent rendering
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type safety
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state and caching
- **Tailwind CSS** - Utility-first styling
- **react-router-dom** - Routing
- **@tanstack/react-virtual** - List virtualization
- **lucide-react** - Icon library
- **date-fns** - Date formatting

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── notifications/   # Feature components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API client
│   ├── api/            # GitHub API integration
│   └── utils/          # Helper functions
├── pages/              # Route pages
├── stores/             # Zustand state stores
├── types/              # TypeScript definitions
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- GitHub Personal Access Token

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Development Server

The application runs at `http://localhost:5173` by default.

### GitHub Authentication

This app uses Personal Access Token (PAT) authentication.

1. Create a PAT at https://github.com/settings/tokens/new
2. Required scopes: `notifications`, `repo`, `read:user`
3. Enter the token on the login page

**Security Note**: Your token is stored in browser localStorage and never sent to any server other than GitHub's API.

## Architecture

See [docs/architecture.md](./docs/architecture.md) for detailed technical architecture and design decisions.

## Performance Targets

- Lighthouse Performance: 90+
- Lighthouse Accessibility: 100
- Bundle size: < 200KB
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `j` | Next notification |
| `k` | Previous notification |
| `x` | Mark current as read |
| `o` | Open in GitHub |
| `r` | Refresh |
| `a` | Select all visible |
| `e` | Mark selected as read (bulk) |
| `u` | Unsubscribe from selected (bulk) |
| `Escape` | Clear selection / blur search |

## Accessibility

WCAG 2.1 AA compliant:
- Semantic HTML (`nav`, `main`, `section`, `article`)
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images
- Focus states for all interactive elements
- 4.5:1 color contrast minimum
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Reduced motion support

## Roadmap

This roadmap aims for **GitHub Notifications parity** first (match native behavior), then explores "Inbox Zero" and **Tauri desktop app** as future enhancements.

### P0 — Parity Core ✅ ("shows what GitHub shows")

- [x] **Working search**: search box filters by repo/title/reason/type; `/` focuses search; `Esc` clears
- [x] **All view + pagination**: "All" includes read + unread; paging loads additional pages
- [x] **Repo list from notifications**: sidebar repository list derived from loaded notifications with counts
- [x] **Auto-load on scroll**: optional toggle (persisted) to auto-load next page near bottom
- [x] **Filter chips**: unread/total counts per repository in sidebar

### P1 — Parity Actions ("can do what GitHub can do")

- [x] **Bulk selection**: row checkboxes + select-all checkbox
- [x] **Bulk actions**: mark read / unsubscribe for selected items
- [ ] **Better action UX**: clearer loading states + error messaging for rate limit/permissions
- [ ] **Keyboard shortcuts for bulk actions**

### P2 — Parity UX ("feels like GitHub")

- [ ] **Preview pane**: optional right-side preview for the selected notification
- [ ] **Settings panel**: configure per_page, polling interval, auto-load default
- [ ] **Better empty/error/loading states**

### Future — Inbox Zero Workflow (optional)

- [ ] **Done/Archive state** separate from read/unread
- [ ] **Saved/Starred** with quick filters
- [ ] **Auto-restore archived** threads on new activity (Octobox-style)
- Requires local persistence (IndexedDB/localStorage) and reconciliation

### Future — OAuth + Backend Mode (optional)

For local PAT usage, the app is intentionally frontend-only. A secure OAuth flow requires a backend for code exchange (never ship `client_secret` in the frontend bundle).

### Future — Tauri Desktop App

Native desktop application with enhanced capabilities:

**Phase 1 - Tauri Shell**
- [ ] Initialize Tauri project wrapping existing React app
- [ ] Configure builds for macOS, Windows, Linux
- [ ] Secure PAT storage using OS keychain (not localStorage)
- [ ] System tray icon with notification badge

**Phase 2 - Native Features**
- [ ] Native OS notifications for new GitHub notifications
- [ ] Global keyboard shortcuts (configurable)
- [ ] Auto-launch on system startup
- [ ] Menu bar integration (macOS)

**Phase 3 - Offline & Sync**
- [ ] SQLite local database for offline access
- [ ] Background sync when online
- [ ] Conflict resolution for offline actions

**Benefits**: Secure token storage, native notifications, system tray presence, faster startup, works offline.

## Contributing

This project is generated as part of a demonstration. Contributions welcome.

## License

MIT

---

Generated by webgen v1.4
