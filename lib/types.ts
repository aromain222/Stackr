// ─── User Input Types ──────────────────────────────────────────────────────────

export type IncomeLevel =
  | 'student'         // Student / no income
  | 'part_time'       // Part-time or irregular
  | 'full_time_low'   // Full-time < $50k
  | 'full_time_mid'   // Full-time $50k–$100k
  | 'full_time_high'  // Full-time $100k+
  | 'self_employed'   // Self-employed / freelance

export type CreditSituation =
  | 'no_credit'         // No credit history
  | 'one_two_cards'     // 1–2 cards, paying on time
  | 'multiple_late'     // Multiple cards, occasionally late
  | 'multiple_on_time'  // Multiple cards, always on time
  | 'score_700_plus'    // Score 700+

export type EmergencyFund =
  | 'none'       // No savings
  | 'under_1mo'  // Less than 1 month
  | 'one_3mo'    // 1–3 months
  | 'over_3mo'   // 3+ months

export type BankingPreference =
  | 'digital'      // Fully digital / app-first
  | 'hybrid'       // Mix of digital and branch
  | 'in_person'    // Prefer in-person / branch
  | 'rates_first'  // Just want best rates

export type FinancialPriority =
  | 'build_credit'
  | 'save_more'
  | 'start_investing'
  | 'manage_debt'
  | 'get_organized'

export type DebtSituation =
  | 'carries_balance'  // Carries a balance most months
  | 'occasionally'     // Occasionally carries balance
  | 'pays_in_full'     // Always pays in full
  | 'no_card'          // No credit card

export type RetirementSituation =
  | '401k_with_match'  // Has 401k with employer match
  | '401k_no_match'    // Has 401k, no employer match
  | 'want_to_start'    // Wants to start
  | 'not_priority'     // Not a priority right now
  | 'dont_know'        // Not sure what they have

export type CheckingPreference =
  | 'no_fees'       // No fees and easy access
  | 'high_yield'    // High-yield interest on balance
  | 'rewards'       // Rewards on spending
  | 'mobile_app'    // Great mobile app
  | 'branch_access' // Physical branch access

export interface UserAnswers {
  income: IncomeLevel
  creditSituation: CreditSituation
  emergencyFund: EmergencyFund
  bankingPreference: BankingPreference
  priority: FinancialPriority
  debtSituation: DebtSituation
  retirement: RetirementSituation
  checkingPreference: CheckingPreference
}

// ─── Domain Types ──────────────────────────────────────────────────────────────

export type ArchetypeId =
  | 'foundation_builder'
  | 'digital_optimizer'
  | 'traditional_hybrid'
  | 'rewards_builder'
  | 'early_wealth_starter'

export type CreditStageId =
  | 'no_credit'
  | 'early_builder'
  | 'emerging_optimizer'
  | 'rewards_optimizer'

export type InvestingReadinessId =
  | 'not_ready'
  | 'conservative'
  | 'moderate'
  | 'growth'

export type InstitutionId =
  | 'sofi'
  | 'capital_one'
  | 'amex'
  | 'chase'
  | 'ally'
  | 'discover'
  | 'fidelity'

// ─── Output Types ──────────────────────────────────────────────────────────────

export interface Recommendation {
  institution: InstitutionId
  product: string
  headline: string
  /** Personalized to the user's specific answers */
  why: string
  /** Why the obvious alternatives aren't the right fit */
  whyNotAlternatives: string
  /** The single most important action to take right now */
  focusNow: string
}

export interface RetirementGuidance {
  status: 'On Track' | 'Contributing' | 'Ready to Start' | 'Deferred' | 'Unchecked'
  action: string
  explanation: string
}

export interface NextMove {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: string
}

export interface AlternateOption {
  institution: InstitutionId
  product: string
  reason: string
}

export type PlanningCategory = 'banking' | 'savings' | 'credit' | 'investing' | 'retirement'

export interface PlanningItem {
  label: string
  category: PlanningCategory
}

export interface PlanningLayer {
  /** 2–4 items: current blockers and foundations to address right now */
  nowPriorities: PlanningItem[]
  /** 2–3 items: opportunities that open once the now layer is handled */
  laterOpportunities: PlanningItem[]
}

export interface SupportBlock {
  /** Why this financial category matters at all */
  categoryMatter: string
  /** Why this specific recommendation fits the user's current situation */
  fitNow: string
  /** The single most common mistake to avoid in this category */
  watchOut: string
}

export interface SupportContent {
  checking: SupportBlock
  savings: SupportBlock
  credit: SupportBlock
  investing: SupportBlock
  retirement: SupportBlock
}

export interface StackOutput {
  primaryArchetype: ArchetypeId
  secondaryArchetype: ArchetypeId
  creditStage: CreditStageId
  investingReadiness: InvestingReadinessId
  investingStyle: string
  checkingRecommendation: Recommendation
  savingsRecommendation: Recommendation
  creditRecommendation: Recommendation
  investingRecommendation: Recommendation
  retirementGuidance: RetirementGuidance
  nextMoves: NextMove[]
  explanation: string
  alternateOption: AlternateOption
  planningLayer: PlanningLayer
  support: SupportContent
}

// ─── Scoring Types ─────────────────────────────────────────────────────────────

export type ArchetypeScores = Record<ArchetypeId, number>

export type AnswerScoreMap = Partial<ArchetypeScores>

export type QuestionScoreConfig = Record<string, AnswerScoreMap>

export type ScoringConfig = Record<keyof UserAnswers, QuestionScoreConfig>
