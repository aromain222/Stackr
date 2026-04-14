import type { ArchetypeId, ArchetypeScores, ScoringConfig, UserAnswers } from './types'

// ─── Scoring Config ─────────────────────────────────────────────────────────────
//
// Each key maps to a question. Each value maps answer IDs → archetype score deltas.
// Weights are calibrated so no single question dominates the outcome.
// Max total per archetype: ~12–14 points.

export const SCORING_CONFIG: ScoringConfig = {
  income: {
    student: { foundation_builder: 3 },
    part_time: { foundation_builder: 2, digital_optimizer: 1 },
    full_time_low: { foundation_builder: 2, digital_optimizer: 1, traditional_hybrid: 1 },
    full_time_mid: { digital_optimizer: 2, rewards_builder: 2, early_wealth_starter: 1, traditional_hybrid: 1 },
    full_time_high: { early_wealth_starter: 3, rewards_builder: 2, digital_optimizer: 1 },
    self_employed: { digital_optimizer: 2, rewards_builder: 2, early_wealth_starter: 1 },
  },

  creditSituation: {
    no_credit: { foundation_builder: 3 },
    one_two_cards: { foundation_builder: 2, digital_optimizer: 1 },
    multiple_late: { foundation_builder: 2, traditional_hybrid: 1 },
    multiple_on_time: { rewards_builder: 2, digital_optimizer: 2, traditional_hybrid: 1 },
    score_700_plus: { rewards_builder: 3, early_wealth_starter: 2, digital_optimizer: 1 },
  },

  emergencyFund: {
    none: { foundation_builder: 3 },
    under_1mo: { foundation_builder: 2 },
    one_3mo: { digital_optimizer: 1, traditional_hybrid: 1, early_wealth_starter: 1 },
    over_3mo: { early_wealth_starter: 3, digital_optimizer: 1, rewards_builder: 1 },
  },

  bankingPreference: {
    digital: { digital_optimizer: 3 },
    hybrid: { traditional_hybrid: 3, digital_optimizer: 1 },
    in_person: { traditional_hybrid: 3 },
    rates_first: { digital_optimizer: 2, early_wealth_starter: 1 },
  },

  priority: {
    build_credit: { foundation_builder: 3 },
    save_more: { foundation_builder: 1, digital_optimizer: 1, early_wealth_starter: 1 },
    start_investing: { early_wealth_starter: 3, digital_optimizer: 1 },
    manage_debt: { foundation_builder: 2, traditional_hybrid: 1 },
    // Increased traditional_hybrid: 1 → 2. "Get organized" correlates strongly with wanting
    // a consolidated, predictable banking relationship — Chase's ecosystem fits this well.
    get_organized: { digital_optimizer: 2, traditional_hybrid: 2 },
  },

  debtSituation: {
    carries_balance: { foundation_builder: 2 },
    occasionally: { foundation_builder: 1, digital_optimizer: 1 },
    // pays_in_full signals discipline and access to premium products, not digital preference.
    // Removed digital_optimizer: 2 — paying in full is a credit/investing signal, not a banking one.
    pays_in_full: { rewards_builder: 2, early_wealth_starter: 1 },
    no_card: { foundation_builder: 2 },
  },

  retirement: {
    '401k_with_match': { early_wealth_starter: 3, digital_optimizer: 1 },
    '401k_no_match': { early_wealth_starter: 2, digital_optimizer: 1 },
    want_to_start: { early_wealth_starter: 2, digital_optimizer: 1, foundation_builder: 1 },
    not_priority: { foundation_builder: 1 },
    dont_know: { foundation_builder: 2 },
  },

  checkingPreference: {
    no_fees: { foundation_builder: 2, digital_optimizer: 1 },
    high_yield: { digital_optimizer: 2, early_wealth_starter: 2 },
    rewards: { rewards_builder: 3 },
    mobile_app: { digital_optimizer: 3 },
    branch_access: { traditional_hybrid: 3 },
  },
}

// ─── Zero-initialized scores ────────────────────────────────────────────────────

const ARCHETYPE_IDS: ArchetypeId[] = [
  'foundation_builder',
  'digital_optimizer',
  'traditional_hybrid',
  'rewards_builder',
  'early_wealth_starter',
]

function zeroScores(): ArchetypeScores {
  return Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0])) as ArchetypeScores
}

// ─── Score calculation ──────────────────────────────────────────────────────────

export function calculateArchetypeScores(answers: UserAnswers): ArchetypeScores {
  const scores = zeroScores()

  for (const [questionKey, answerMap] of Object.entries(SCORING_CONFIG)) {
    const answerValue = answers[questionKey as keyof UserAnswers]
    const deltas = answerMap[answerValue]
    if (!deltas) continue

    for (const [archetypeId, delta] of Object.entries(deltas)) {
      scores[archetypeId as ArchetypeId] += delta
    }
  }

  return scores
}

// ─── Archetype ranking ──────────────────────────────────────────────────────────

/** Returns archetypes sorted by score descending */
export function rankArchetypes(scores: ArchetypeScores): ArchetypeId[] {
  return (Object.entries(scores) as [ArchetypeId, number][])
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)
}

export function getPrimaryArchetype(scores: ArchetypeScores): ArchetypeId {
  return rankArchetypes(scores)[0]
}

export function getSecondaryArchetype(scores: ArchetypeScores, primary: ArchetypeId): ArchetypeId {
  return rankArchetypes(scores).find((id) => id !== primary) ?? 'digital_optimizer'
}
