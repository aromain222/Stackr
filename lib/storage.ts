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

// ─── Answer validation ─────────────────────────────────────────────────────────
// Guards against corrupted, partial, or schema-mismatched localStorage data.
// All 8 keys must be present with a recognised value — anything else is discarded.

const VALID_VALUES = {
  income: ['student', 'part_time', 'full_time_low', 'full_time_mid', 'full_time_high', 'self_employed'],
  creditSituation: ['no_credit', 'one_two_cards', 'multiple_late', 'multiple_on_time', 'score_700_plus'],
  emergencyFund: ['none', 'under_1mo', 'one_3mo', 'over_3mo'],
  bankingPreference: ['digital', 'hybrid', 'in_person', 'rates_first'],
  priority: ['build_credit', 'save_more', 'start_investing', 'manage_debt', 'get_organized'],
  debtSituation: ['carries_balance', 'occasionally', 'pays_in_full', 'no_card'],
  retirement: ['401k_with_match', '401k_no_match', 'want_to_start', 'not_priority', 'dont_know'],
  checkingPreference: ['no_fees', 'high_yield', 'rewards', 'mobile_app', 'branch_access'],
} as const

// Optional v2 fields: if present must be valid; absent is fine (backward compat with 8-question profiles)
const VALID_OPTIONAL = {
  paymentFrequency: ['direct_deposit', 'irregular_cash', 'business_income', 'no_income'],
  moneyStyle: ['set_and_forget', 'hands_on', 'simple_and_clear', 'maximize_everything'],
} as const

function isValidAnswers(data: unknown): data is UserAnswers {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false
  const d = data as Record<string, unknown>
  const requiredOk = (Object.keys(VALID_VALUES) as (keyof typeof VALID_VALUES)[]).every(
    (key) => (VALID_VALUES[key] as readonly string[]).includes(d[key] as string)
  )
  if (!requiredOk) return false
  return (Object.keys(VALID_OPTIONAL) as (keyof typeof VALID_OPTIONAL)[]).every(
    (key) => d[key] === undefined || (VALID_OPTIONAL[key] as readonly string[]).includes(d[key] as string)
  )
}

// ─── Answers ───────────────────────────────────────────────────────────────────

export function loadAnswers(): UserAnswers | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(KEYS.answers)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidAnswers(parsed)) {
      // Discard corrupt or schema-mismatched data rather than passing it downstream
      localStorage.removeItem(KEYS.answers)
      return null
    }
    return parsed
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
