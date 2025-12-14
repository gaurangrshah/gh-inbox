# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2024-12-14

### Added

- **Shift-click range selection**: Hold Shift and click checkboxes to select a range of notifications
- **All-notifications view**: View all notifications regardless of read status with pagination
- **Pagination UI component**: Numerical page navigation (prepared for future use)
- **Auto-load default enabled**: Infinite scroll enabled by default for better UX

### Fixed

- **CSP/IPC permissions**: Fixed Content Security Policy to allow `ipc:` and `tauri:` protocols for Tauri v2 compatibility
- **Notification permissions**: Added required Tauri capabilities for desktop notifications
- **304 polling**: Fixed handling of "Not Modified" responses during background sync
- **Checkbox selection**: Fixed selection state not persisting correctly

### Changed

- Updated `src-tauri/tauri.conf.json` CSP to include IPC protocols
- Updated `index.html` CSP meta tag for Tauri compatibility
- Updated `src-tauri/capabilities/default.json` with notification permissions

### Known Limitations

- GitHub `/notifications` API doesn't include Dependabot alerts and security advisories
- Total notification count may differ from github.com (which aggregates multiple API endpoints)

## [0.1.0] - 2024-12-13

### Added

- Initial release with GitHub Primer dark theme
- Real-time notification sync (60-second polling)
- Vim-style keyboard navigation (j/k/x/o/r/Escape)
- Advanced filtering by repository, reason, type, and status
- Rate limit tracking with visual indicator
- Virtualized lists for smooth performance
- Optimistic updates with rollback on error
- Bulk operations (mark as read, unsubscribe)
- Tauri v2 desktop app with:
  - Secure keychain storage for GitHub PAT
  - System tray integration
  - Native window management

### Technical

- React 18 with TypeScript
- Zustand for state management
- TanStack Query for data fetching
- Tailwind CSS with GitHub Primer design tokens
- Tauri v2 with Rust backend
