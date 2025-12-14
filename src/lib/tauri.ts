/**
 * Tauri API bindings for secure token storage
 *
 * Uses OS keychain for secure PAT storage when running in Tauri,
 * falls back to localStorage when running in browser.
 */

import { invoke } from '@tauri-apps/api/core'

/** Check if running in Tauri environment */
export const isTauri = (): boolean => {
  return '__TAURI_INTERNALS__' in window
}

/**
 * Store GitHub PAT securely
 * - In Tauri: Uses OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
 * - In browser: Falls back to localStorage
 */
export async function storeToken(token: string): Promise<void> {
  if (isTauri()) {
    await invoke('store_token', { token })
  } else {
    localStorage.setItem('github-inbox-token', token)
  }
}

/**
 * Retrieve GitHub PAT
 * - In Tauri: Retrieves from OS keychain
 * - In browser: Retrieves from localStorage
 */
export async function getToken(): Promise<string | null> {
  if (isTauri()) {
    const token = await invoke<string | null>('get_token')
    return token
  } else {
    return localStorage.getItem('github-inbox-token')
  }
}

/**
 * Delete GitHub PAT
 * - In Tauri: Removes from OS keychain
 * - In browser: Removes from localStorage
 */
export async function deleteToken(): Promise<void> {
  if (isTauri()) {
    await invoke('delete_token')
  } else {
    localStorage.removeItem('github-inbox-token')
  }
}
