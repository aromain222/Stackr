import type { UserAnswers } from './types'

// ─── Storage keys ──────────────────────────────────────────────────────────────

const KEYS = {
  answers: 'stackwise_answers',
  meta: 'stackwise_meta',
} as const

// ─── Saved meta ────────────────────────────────────────────────────────────────
// Lightweight snapshot saved alongside answers so the landing page can show
// a personalised return state without re-running the engine.

export interface SavedMeta {
  savedAt: string        // ISO date string
  archetypeName: string  // e.g. "Foundation Builder"
  creditStageName: string // e.g. "Early Builder"
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

// ─── Answers ───────────────────────────────────────────────────────────────────

export function loadAnswers(): UserAnswers | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(KEYS.answers)
    return raw ? (JSON.parse(raw) as UserAnswers) : null
  } catch {
    return null
  }
}

export function saveAnswers(answers: UserAnswers): void {
  localStorage.setItem(KEYS.answers, JSON.stringify(answers))
}

// ─── Meta ──────────────────────────────────────────────────────────────────────

export function loadMeta(): SavedMeta | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(KEYS.meta)
    return raw ? (JSON.parse(raw) as SavedMeta) : null
  } catch {
    return null
  }
}

export function saveMeta(meta: SavedMeta): void {
  localStorage.setItem(KEYS.meta, JSON.stringify(meta))
}

// ─── Clear ─────────────────────────────────────────────────────────────────────

export function clearProfile(): void {
  localStorage.removeItem(KEYS.answers)
  localStorage.removeItem(KEYS.meta)
}

// ─── Date formatting ───────────────────────────────────────────────────────────

export function formatSavedDate(isoString: string): string {
  const saved = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - saved.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return saved.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
