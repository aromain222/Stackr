import type {
  InvestingReadinessId,
  ArchetypeId,
  Recommendation,
  UserAnswers,
} from './types'

// ─── Investing Readiness Scoring ───────────────────────────────────────────────
//
// Score is computed from three factors:
//   Emergency fund:  none=0, under_1mo=1, one_3mo=2, over_3mo=3
//   Income:          student=0, part_time=1, full_time_low=1, full_time_mid=2, full_time_high=3, self_employed=2
//   Debt penalty:    carries_balance=-2, occasionally=-1, pays_in_full=0, no_card=0
//
// Total range: -2 to 6
//   ≤ 2  → not_ready
//   3–4  → conservative
//   5    → moderate
//   6    → growth

const EMERGENCY_FUND_SCORE: Record<string, number> = {
  none: 0,
  under_1mo: 1,
  one_3mo: 2,
  over_3mo: 3,
}

const INCOME_SCORE: Record<string, number> = {
  student: 0,
  part_time: 1,
  full_time_low: 1,
  full_time_mid: 2,
  full_time_high: 3,
  self_employed: 2,
}

const DEBT_PENALTY: Record<string, number> = {
  carries_balance: -2,
  occasionally: -1,
  pays_in_full: 0,
  no_card: 0,
}

export function calculateInvestingReadiness(answers: UserAnswers): InvestingReadinessId {
  const efScore = EMERGENCY_FUND_SCORE[answers.emergencyFund] ?? 0
  const incomeScore = INCOME_SCORE[answers.income] ?? 0
  const debtPenalty = DEBT_PENALTY[answers.debtSituation] ?? 0
  const total = efScore + incomeScore + debtPenalty

  if (total <= 2) return 'not_ready'
  if (total <= 4) return 'conservative'
  if (total <= 5) return 'moderate'
  return 'growth'
}

// ─── Investing Style Labels ─────────────────────────────────────────────────────

export function getInvestingStyle(readiness: InvestingReadinessId): string {
  const styles: Record<InvestingReadinessId, string> = {
    not_ready: 'Savings-first',
    conservative: 'Capital Preservation',
    moderate: 'Balanced Growth',
    growth: 'Aggressive Growth',
  }
  return styles[readiness]
}

// ─── Investing Readiness Labels ─────────────────────────────────────────────────

export interface InvestingReadinessDefinition {
  id: InvestingReadinessId
  name: string
  description: string
}

export const INVESTING_READINESS: Record<InvestingReadinessId, InvestingReadinessDefinition> = {
  not_ready: {
    id: 'not_ready',
    name: 'Not Ready',
    description: 'Investing before having an emergency fund means selling in a downturn. Build the cushion first.',
  },
  conservative: {
    id: 'conservative',
    name: 'Conservative',
    description: 'Foundation is forming. Small, consistent contributions in low-risk allocations build the habit.',
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    description: 'Solid footing to take on market exposure. Index funds provide diversification with minimal cost.',
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'Strong position to maximize tax-advantaged contributions and deploy capital aggressively.',
  },
}

// ─── Personalization helpers ───────────────────────────────────────────────────

const INCOME_CONTEXT: Record<string, string> = {
  student: 'limited income',
  part_time: 'variable income',
  full_time_low: 'a steady income',
  full_time_mid: 'a solid income',
  full_time_high: 'a high income',
  self_employed: 'self-employment income',
}

const EF_CONTEXT: Record<string, string> = {
  none: 'no emergency fund',
  under_1mo: 'less than one month of expenses saved',
  one_3mo: 'one to three months of expenses saved',
  over_3mo: 'three or more months of expenses saved',
}

// ─── Investing Recommendations ──────────────────────────────────────────────────

export function getInvestingRecommendation(
  readiness: InvestingReadinessId,
  archetype: ArchetypeId,
  answers: UserAnswers
): Recommendation {
  const incomeCtx = INCOME_CONTEXT[answers.income] ?? 'your income'
  const efCtx = EF_CONTEXT[answers.emergencyFund] ?? 'your current savings'

  switch (readiness) {
    case 'not_ready': {
      const wantToInvest = answers.priority === 'start_investing'
      return {
        institution: 'ally',
        product: 'Ally High-Yield Savings Account',
        headline: wantToInvest
          ? 'You want to invest — but first you need a cushion that lets you stay invested'
          : 'Build your safety net before entering the market',
        why: wantToInvest
          ? `Investing is the right goal. But with ${efCtx} and ${incomeCtx}, you'd be one emergency away from having to sell at exactly the wrong time. The biggest threat to long-term returns isn't picking the wrong stock — it's being forced to liquidate during a downturn because you needed cash. Three months of expenses in high-yield savings is what lets you stay invested through volatility. Ally's 4.20% APY means your cushion earns real yield while you build it.`
          : `With ${efCtx} and ${incomeCtx}, investing right now creates more risk than return. If the market drops and you need cash, you sell at the worst time. The mathematically correct move is to direct every available dollar into a high-yield savings account until you have 3 months of expenses. Ally's 4.20% APY means your emergency fund earns real yield while you build it.`,
        whyNotAlternatives:
          "Brokerage accounts, target-date funds, and even conservative ETFs have drawdown risk. If an emergency hits while you're invested, you're forced to sell at a loss. High-yield savings is the only vehicle that preserves capital and earns yield simultaneously.",
        focusNow: wantToInvest
          ? "Open an Ally Savings account and automate a fixed weekly transfer — even $25/week counts. Once you cross 3 months of expenses, open a Roth IRA at Fidelity immediately. The investing goal is still the destination — this is the required step before it."
          : 'Open an Ally Savings account, set up a weekly auto-transfer of any fixed amount — even $25 counts. Make it automatic so it happens without friction. Revisit investing once you cross 3 months of expenses.',
      }
    }

    case 'conservative':
      return {
        institution: 'sofi',
        product: 'SoFi Invest — Roth IRA (Target Date Fund)',
        headline: 'Start small, stay consistent, let time do the work',
        why: `You have ${efCtx} and ${incomeCtx}. You're close to being truly investment-ready. A Roth IRA through SoFi with $25–$50/month in a target-date fund gives you market exposure without requiring you to make allocation decisions. Contributions are after-tax, so withdrawals in retirement are completely tax-free — the ideal vehicle for someone early in their career.`,
        whyNotAlternatives:
          "Taxable brokerage accounts don't provide tax advantages and waste your annual Roth IRA allowance. Savings accounts at this stage miss out on long-term compounding. Target-date funds are better than picking stocks — they auto-rebalance and adjust allocation as you age.",
        focusNow:
          'Open a Roth IRA at SoFi or Fidelity, select a target-date fund matching your expected retirement year (e.g., "2060 Fund"), and automate $50/month. Increase the contribution every time you get a raise.',
      }

    case 'moderate':
      return {
        institution: 'ally',
        product: 'Fidelity — Roth IRA (Total Market Index Funds)',
        headline: "You're ready to invest seriously — keep it simple with index funds",
        why: `With ${efCtx} and ${incomeCtx}, you have the foundation to take on real market exposure. Low-cost total market index funds (Fidelity FZROX or Vanguard VTSAX) give you ownership of the entire U.S. equity market for near-zero cost. Over 20+ years, they outperform 90%+ of actively managed funds after fees. With ${answers.retirement === '401k_with_match' ? 'employer match already captured, adding a Roth IRA' : 'a Roth IRA as your next account'}, you maximize tax-advantaged space.`,
        whyNotAlternatives:
          "Actively managed funds charge 0.50–1.5% in fees and rarely beat the index over 15+ years. Robo-advisors like Betterment add value for beginners but charge 0.25% on top of fund fees. At this stage, you don't need the hand-holding — just pick the total market fund and automate.",
        focusNow:
          answers.retirement === '401k_with_match'
            ? 'Maximize your 401k match first (free 50–100% return), then open a Roth IRA at Fidelity and invest in FZROX. Both accounts provide tax advantages that a taxable brokerage cannot replicate.'
            : 'Open a Roth IRA at Fidelity (no minimum, no fees), invest in FZROX, and automate monthly contributions. Max is $7,000/year — that\'s $583/month if you want to hit the limit.',
      }

    case 'growth':
      return {
        institution: 'ally',
        product: 'Fidelity — Taxable Brokerage + Maxed Roth IRA',
        headline: 'Maximize tax-advantaged accounts, then build taxable wealth',
        why: `With ${efCtx}, ${incomeCtx}, and no revolving debt, you're in position to deploy capital at scale. The priority order: (1) capture full 401k employer match, (2) max Roth IRA at $7,000/year, (3) if cash remains, open a taxable brokerage for additional index fund investment. Fidelity's FZROX has a 0.00% expense ratio — the market, for free.`,
        whyNotAlternatives:
          "Robinhood's gamified interface encourages overtrading. Betterment's 0.25% fee compounds against you. Crypto belongs in a speculative allocation, not the core portfolio. Single stocks add concentration risk without return improvement for most investors. Index funds have 40 years of data supporting their superiority for passive investors.",
        focusNow:
          'Confirm your 401k contribution rate captures the full employer match. Open a Roth IRA at Fidelity if you haven\'t — contribute the full $7,000 for this tax year before April. Then open a taxable brokerage and invest surplus monthly into FZROX or FSKAX.',
      }

    default:
      return {
        institution: 'ally',
        product: 'Ally High-Yield Savings',
        headline: 'Start with savings before investing',
        why: 'Build your emergency fund first.',
        whyNotAlternatives: 'Other options carry risk you should not take on yet.',
        focusNow: 'Save 3 months of expenses, then revisit.',
      }
  }
}
