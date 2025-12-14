# Parity-first plan + README roadmap

## Scope and principles
- **Primary goal**: Match GitHub Notifications behavior closely (parity).
- **Secondary**: Document “Inbox Zero” workflow as optional future track.
- **Auth**: Assume **local PAT** for now, but document a future **OAuth+server** option.

## Deliverable A — Roadmap content to add to README
Add a `## Roadmap` section in `[README.md](/home/gs/webgen/projects/github-inbox - webgen/README.md)` with:
- Parity milestones (P0/P1/P2)
- Optional Inbox Zero track
- Future OAuth/server option (non-blocking)

## Deliverable B — Implementation plan (agent-executable)

### P0 (Parity Core): “Shows what GitHub shows”
- **Search works**
  - Implement client-side filtering for title/repo/reason/type.
  - Add `/` keyboard shortcut to focus search; `Esc` clears.
  - Acceptance: search results match visible list; no UI lag for ~2k items.
- **Pagination parity**
  - Current “Load more” is OK; add auto-load on scroll (optional toggle).
  - Add “loading more…” indicator and stable scroll behavior.
  - Acceptance: can load N pages without losing selection or scroll.
- **Repo sidebar parity**
  - Repository list should include repos across **loaded** pages.
  - Add filter chips/counts and “clear repo filters”.
  - Acceptance: selecting a repo filters list and updates counts.

### P1 (Parity Actions): “Can do what GitHub can do”
- **Bulk selection**
  - Wire top “Select all” checkbox + per-row checkboxes for multi-select.
  - Add bulk actions (Mark read, Unsubscribe) and keyboard shortcuts.
  - Acceptance: bulk actions apply to all selected; selection state persists while paging.
- **Per-item actions parity**
  - Ensure “Mark read”, “Open”, “Unsubscribe” match GitHub semantics.
  - Add better error handling for permission/rate-limit.

### P2 (Parity UX): “Feels like GitHub”
- **Preview pane**
  - Add right-side detail/preview panel for selected item.
  - Implement “open in GitHub” from preview.
- **Quality**
  - Better empty/error states, loading states.
  - Add settings for per_page, polling interval, auto-load.

### Future track: Inbox Zero (optional)
- **Archive/Done state** separate from read/unread.
- Optional “auto-restore on new activity” model.
- Requires local persistence (indexedDB/localStorage) and reconciliation.

### Future track: OAuth/server option (non-blocking)
- Document secure OAuth code-exchange backend approach.
- Keep local PAT as default.

### Future track: Tauri Desktop App
- **Goal**: Native desktop app with system tray, notifications, and offline support.
- **Phase 1 - Tauri Shell**
  - Initialize Tauri project wrapping existing React app.
  - Configure build for macOS, Windows, Linux.
  - Implement secure PAT storage using Tauri's keyring/secure storage APIs.
  - Add system tray icon with notification badge.
- **Phase 2 - Native Features**
  - Native OS notifications for new GitHub notifications.
  - Global keyboard shortcuts (configurable).
  - Auto-launch on system startup (optional).
  - Menu bar integration (macOS).
- **Phase 3 - Offline & Sync**
  - SQLite local database for offline access.
  - Background sync when online.
  - Conflict resolution for actions taken offline.
- **Benefits over web**:
  - Secure token storage (OS keychain vs localStorage)
  - Native notifications
  - System tray presence
  - Faster startup, lower memory
  - Works offline

## Files likely to be touched (when implementing)
- Search + UI wiring:
  - `[src/pages/InboxPage.tsx](/home/gs/webgen/projects/github-inbox - webgen/src/pages/InboxPage.tsx)`
  - `[src/components/layout/Header.tsx](/home/gs/webgen/projects/github-inbox - webgen/src/components/layout/Header.tsx)`
- Sidebar repo list:
  - `[src/components/layout/Sidebar.tsx](/home/gs/webgen/projects/github-inbox - webgen/src/components/layout/Sidebar.tsx)`
  - `[src/stores/filterStore.ts](/home/gs/webgen/projects/github-inbox - webgen/src/stores/filterStore.ts)`
- Pagination/infinite query:
  - `[src/hooks/useNotifications.ts](/home/gs/webgen/projects/github-inbox - webgen/src/hooks/useNotifications.ts)`
  - `[src/lib/api/notifications.ts](/home/gs/webgen/projects/github-inbox - webgen/src/lib/api/notifications.ts)`
- Selection + bulk actions:
  - `[src/components/notifications/NotificationList.tsx](/home/gs/webgen/projects/github-inbox - webgen/src/components/notifications/NotificationList.tsx)`
  - `[src/components/notifications/NotificationItem.tsx](/home/gs/webgen/projects/github-inbox - webgen/src/components/notifications/NotificationItem.tsx)`
- Docs:
  - `[README.md](/home/gs/webgen/projects/github-inbox - webgen/README.md)`

## Acceptance checklist (high-signal)
- “All” view shows both read + unread (`all=true`), paging loads more.
- Search filters list and is keyboard-accessible.
- Repo sidebar populates and filters correctly.
- Bulk selection works with checkboxes + top checkbox.
- No recurring errors during polling/idle; 304 handled.


