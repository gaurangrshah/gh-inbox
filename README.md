# GitHub Inbox

A modern, efficient GitHub notifications manager with real-time sync, keyboard shortcuts, and advanced filtering. Available as both a **web app** and a **native desktop app**.

## Features

- **Real-time Notifications** - 60-second background sync with GitHub API
- **Keyboard Navigation** - vim-style shortcuts (j/k/x/o/r/Escape)
- **Advanced Filtering** - Filter by repository, reason, type, and status
- **Rate Limit Tracking** - Visual indicator with automatic retry
- **Dark Theme** - GitHub Primer design system dark theme
- **Virtualized Lists** - Smooth performance with @tanstack/react-virtual
- **Optimistic Updates** - Instant UI feedback with rollback on error
- **Inbox Zero Workflow** - Mark as read, unsubscribe, bulk operations
- **Desktop App** - Native system tray, secure keychain storage (Tauri)

## Quick Start

### Option 1: Web App (Browser)

```bash
# Clone and install
git clone <repo-url>
cd github-inbox
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

### Option 2: Desktop App (Native)

```bash
# Install dependencies (see Platform Prerequisites below)
pnpm install

# Run desktop app
pnpm tauri dev
```

A native window will open automatically.

---

## Web App

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server at http://localhost:5173 |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |

### GitHub Authentication

1. Create a Personal Access Token at https://github.com/settings/tokens/new
2. Required scopes: `notifications`, `repo`, `read:user`
3. Enter the token on the login page

**Security Note**: In the web app, your token is stored in browser localStorage and only sent to GitHub's API.

---

## Desktop App (Tauri)

The desktop app wraps the React frontend in a native window using Tauri v2, providing:
- **Secure token storage** in OS keychain (not localStorage)
- **System tray** with quick actions
- **Native window** management
- **Smaller binary** than Electron (~10MB vs ~150MB)

### Prerequisites

#### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustc --version  # Should be 1.75+
```

#### 2. Install Platform Dependencies

<details>
<summary><strong>🐧 Linux (Ubuntu/Debian)</strong></summary>

```bash
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  pkg-config
```

| Package | Purpose |
|---------|---------|
| `libwebkit2gtk-4.1-dev` | WebView for rendering the UI |
| `libgtk-3-dev` | GTK3 for native window management |
| `libayatana-appindicator3-dev` | System tray support |
| `librsvg2-dev` | SVG icon rendering |
| `libssl-dev` | TLS/SSL support |
| `pkg-config` | Build configuration |

</details>

<details>
<summary><strong>🍎 macOS</strong></summary>

```bash
xcode-select --install
```

</details>

<details>
<summary><strong>🪟 Windows</strong></summary>

1. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Select "Desktop development with C++"
2. WebView2 is usually pre-installed on Windows 10/11

</details>

### Commands

| Command | Description |
|---------|-------------|
| `pnpm tauri dev` | Run desktop app in development mode (hot reload) |
| `pnpm tauri build` | Build production binary for your platform |

### How It Works

**Development mode** (`pnpm tauri dev`):
- Vite dev server runs at http://localhost:5173
- Tauri opens a native window that loads from the dev server
- Hot reload works - edit code and see changes instantly
- Use the **native Tauri window**, not your browser

**Production build** (`pnpm tauri build`):
- Frontend is bundled into static files
- Everything is embedded in a single binary
- No web server required - runs completely offline
- Binary location: `src-tauri/target/release/`

### Security

Your GitHub PAT is stored securely in your operating system's keychain:

| Platform | Storage Location |
|----------|------------------|
| macOS | Keychain Access |
| Windows | Windows Credential Manager |
| Linux | Secret Service (libsecret) |

The token is **never** stored in localStorage when running as a desktop app.

### Troubleshooting

| Error | Solution |
|-------|----------|
| `gdk-3.0 was not found` | Install `libgtk-3-dev` |
| `webkit2gtk-4.1 not found` | Install `libwebkit2gtk-4.1-dev` |
| `pkg-config not found` | Install `pkg-config` |
| `error: linker 'cc' not found` | Install build essentials: `sudo apt install build-essential` |
| Window doesn't open | Verify all prerequisites are installed |
| App opens but shows blank | Check browser console for errors (F12 in Tauri window) |

---

## Usage Guide

### Keyboard Shortcuts

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
| `p` | Toggle preview pane |
| `Escape` | Clear selection / blur search |

### Sidebar Navigation

- **Inbox** - All notifications (default view)
- **Repository list** - Filter by repository (click to filter)
- **Unread counts** - Shows unread/total per repository

### Bulk Operations

1. Select notifications using checkboxes or `a` to select all
2. Use toolbar buttons or keyboard shortcuts:
   - **Done** (or `e`) - Mark selected as read
   - **Unsubscribe** (or `u`) - Unsubscribe from threads

### Settings

Click the gear icon to configure:
- **Polling interval** - How often to check for new notifications (30-300 seconds)
- **Items per page** - Number of notifications to load (10-100)
- **Auto-load** - Automatically load more when scrolling

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| State | Zustand, TanStack Query |
| Styling | Tailwind CSS (GitHub Primer dark theme) |
| Desktop | Tauri v2 (Rust backend) |
| Security | OS keychain via `keyring` crate |

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and API client
│   ├── pages/              # Route pages
│   ├── stores/             # Zustand state stores
│   └── types/              # TypeScript definitions
├── src-tauri/              # Tauri/Rust backend
│   ├── src/lib.rs          # Rust commands (keychain, tray)
│   └── tauri.conf.json     # Tauri configuration
└── package.json
```

## Roadmap

### Completed ✅

- **P0 - Core**: Search, pagination, repo filtering, auto-load
- **P1 - Actions**: Bulk selection, mark read, unsubscribe, keyboard shortcuts
- **P2 - UX**: Preview pane, settings panel, polished states
- **Tauri Phase 1**: Desktop shell, keychain storage, system tray

### In Progress 🚧

- **Tauri Phase 2**: Native notifications, global shortcuts, auto-launch

### Planned 📋

- **Tauri Phase 3**: Offline mode with SQLite, background sync
- **Inbox Zero**: Done/Archive states, saved filters

## Accessibility

WCAG 2.1 AA compliant:
- Semantic HTML structure
- Keyboard navigation support
- Focus states for all interactive elements
- 4.5:1 color contrast minimum
- ARIA labels for icon-only buttons
- Reduced motion support

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT
