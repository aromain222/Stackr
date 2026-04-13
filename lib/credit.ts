import type {
  CreditSituation,
  CreditStageId,
  ArchetypeId,
  Recommendation,
  UserAnswers,
} from './types'

// ─── Credit Stage Assignment ───────────────────────────────────────────────────

const CREDIT_SITUATION_TO_STAGE: Record<CreditSituation, CreditStageId> = {
  no_credit: 'no_credit',
  one_two_cards: 'early_builder',
  multiple_late: 'early_builder',  // Late payments push them back to builder stage
  multiple_on_time: 'emerging_optimizer',
  score_700_plus: 'rewards_optimizer',
}

export function determineCreditStage(answers: UserAnswers): CreditStageId {
  return CREDIT_SITUATION_TO_STAGE[answers.creditSituation]
}

// ─── Credit Stage Labels ────────────────────────────────────────────────────────

export interface CreditStageDefinition {
  id: CreditStageId
  name: string
  description: string
  scoreRange: string
}

export const CREDIT_STAGES: Record<CreditStageId, CreditStageDefinition> = {
  no_credit: {
    id: 'no_credit',
    name: 'No Credit',
    description: 'No credit file exists yet. First step is establishing history.',
    scoreRange: 'No score',
  },
  early_builder: {
    id: 'early_builder',
    name: 'Early Builder',
    description: 'Credit history is young or thin. Building consistency is the priority.',
    scoreRange: '580–669',
  },
  emerging_optimizer: {
    id: 'emerging_optimizer',
    name: 'Emerging Optimizer',
    description: 'Solid foundation in place. Now optimize utilization and product mix.',
    scoreRange: '670–739',
  },
  rewards_optimizer: {
    id: 'rewards_optimizer',
    name: 'Rewards Optimizer',
    description: 'Strong credit unlocks premium products with significant rewards upside.',
    scoreRange: '740+',
  },
}

// ─── Personalization Helpers ───────────────────────────────────────────────────

const INCOME_CONTEXT: Record<string, string> = {
  student: 'limited income',
  part_time: 'variable income',
  full_time_low: 'a steady income',
  full_time_mid: 'a solid income',
  full_time_high: 'a high income',
  self_employed: 'self-employment income',
}

// ─── Credit Recommendations by Stage + Archetype ──────────────────────────────

export function getCreditRecommendation(
  creditStage: CreditStageId,
  archetype: ArchetypeId,
  answers: UserAnswers
): Recommendation {
  const incomeCtx = INCOME_CONTEXT[answers.income] ?? 'your income'

  switch (creditStage) {
    case 'no_credit':
      return {
        institution: answers.bankingPreference === 'digital' ? 'discover' : 'capital_one',
        product:
          answers.bankingPreference === 'digital'
            ? 'Discover it® Secured Credit Card'
            : 'Capital One Platinum Secured Card',
        headline: 'Build your credit file from zero',
        why: `You have no credit history, which means most unsecured cards are unavailable regardless of your income. A secured card uses a refundable deposit as your credit limit, reports to all three bureaus, and builds your score the same way an unsecured card does — through consistent on-time payments and low utilization. With ${incomeCtx}, this is the fastest path to an actionable credit profile.`,
        whyNotAlternatives:
          'Unsecured starter cards like Capital One QuicksilverOne charge annual fees and require a credit file to exist first. Store cards have narrow acceptance. Becoming an authorized user helps but builds history slower. Secured cards are the direct, fastest route.',
        focusNow:
          'Make one small purchase per month, pay the statement in full before the due date, and keep utilization under 10%. After 7–12 months of consistent payments, request a credit limit increase or ask to graduate to an unsecured card.',
      }

    case 'early_builder':
      if (answers.creditSituation === 'multiple_late') {
        return {
          institution: 'capital_one',
          product: 'Capital One QuicksilverOne Cash Rewards',
          headline: 'Rebuild consistency before upgrading products',
          why: `You have multiple cards but some late payments have dented your score. With ${incomeCtx}, the priority is demonstrating 12+ months of perfect payment history before applying for premium cards. Capital One QuicksilverOne accepts lower scores while still earning 1.5% cashback — making it a productive builder card.`,
          whyNotAlternatives:
            "Chase Freedom, Amex Gold, and most rewards cards require 670+ scores with clean payment history. Applying now means a hard inquiry with a likely denial. Capital One's approval algorithm is notably more lenient for users rebuilding from imperfect history.",
          focusNow:
            'Set every existing card to autopay the full statement balance. Zero late payments for the next 12 months is worth more to your score than any other single action. After 12 clean months, reassess for a Chase Freedom Unlimited.',
        }
      }
      return {
        institution: 'discover',
        product: 'Discover it® Cash Back',
        headline: 'Upgrade to a card that earns while you build',
        why: `With 1–2 cards and consistent on-time payments, you've proven the fundamentals. Discover it Cash Back earns 5% on rotating quarterly categories and 1% everywhere else — with no annual fee. It's a real rewards card, not a placeholder, and Discover's approval rates for thin files are higher than most issuers. With ${incomeCtx}, this is a realistic next card.`,
        whyNotAlternatives:
          'Chase Freedom Unlimited requires a stronger credit file (typically 670+). Amex cards require established history. Capital One Quicksilver is an option but Discover it matches first-year cashback — effectively doubling rewards in year one with the Cashback Match.',
        focusNow:
          'Apply, then immediately set up autopay for the full statement balance. Activate quarterly categories the day they go live. Keep this card under 15% utilization to maximize score growth alongside rewards.',
      }

    case 'emerging_optimizer':
      return {
        institution: archetype === 'traditional_hybrid' || archetype === 'early_wealth_starter' ? 'chase' : 'discover',
        product:
          archetype === 'traditional_hybrid' || archetype === 'early_wealth_starter'
            ? 'Chase Freedom Unlimited®'
            : 'Discover it® Cash Back',
        headline: 'Unlock a real rewards card with your solid history',
        why: `Multiple on-time payments and a growing credit score open the door to legitimate rewards cards. Chase Freedom Unlimited earns 1.5% on all purchases with no annual fee, and becomes significantly more valuable if you later add a Chase Sapphire card — your points convert from 1.5¢ to 2.25¢+ each for travel. With ${incomeCtx}, this is a card you'll want to hold for years.`,
        whyNotAlternatives:
          "Premium travel cards (Sapphire Reserve, Amex Gold) require 700+ scores and charge $250–$550 annual fees that don't make sense until spending justifies them. Cash-back-only cards like Citi Double Cash are fine but don't build toward a points ecosystem.",
        focusNow:
          "If you're in the Chase ecosystem, use Freedom Unlimited for everyday spend, Chase Freedom Flex for 5% categories, and a Chase Sapphire as your third card in 12–18 months. The trio creates a points earning engine.",
      }

    case 'rewards_optimizer':
      if (
        answers.debtSituation === 'pays_in_full' &&
        (archetype === 'rewards_builder' || archetype === 'early_wealth_starter')
      ) {
        return {
          institution: answers.priority === 'start_investing' ? 'amex' : 'chase',
          product:
            answers.priority === 'start_investing'
              ? 'American Express® Gold Card'
              : 'Chase Sapphire Preferred®',
          headline: 'Premium rewards for a premium credit profile',
          why: `Your 700+ score and consistent full-payment history qualify you for the top tier. ${
            answers.priority === 'start_investing'
              ? 'Amex Gold earns 4x at restaurants and U.S. supermarkets — two of the highest-spend categories for most adults. With annual dining credits offsetting much of the $250 fee, the net cost is low relative to the rewards earned.'
              : 'Chase Sapphire Preferred earns 3x on dining, 2x on travel, and transfers to 14 airline and hotel partners at 1:1 — meaning points can be worth 2–4¢ each through transfer partners versus 1¢ for cash back.'
          } With ${incomeCtx}, the annual fee is justified by spend alone.`,
          whyNotAlternatives:
            "Discover it and Capital One Quicksilver are fine starter cards but earn at flat rates that don't scale with higher spend. The opportunity cost of staying on a no-fee card at 1.5% versus a premium card at 3–4x in key categories grows every year.",
          focusNow:
            answers.priority === 'start_investing'
              ? 'Apply, set up full-balance autopay, then immediately claim the $120 dining credit and $120 Uber Cash credits to offset the annual fee. Never carry a balance on a rewards card — interest erases all gains immediately.'
              : 'Apply, enroll in Pay Yourself Back to redeem at 1.25¢/point for groceries and gas while building toward a travel redemption. Add Chase Freedom Unlimited as a companion for non-bonus spend.',
        }
      }
      return {
        institution: 'chase',
        product: 'Chase Freedom Unlimited®',
        headline: 'Your credit is strong — unlock a full rewards ecosystem',
        why: `A 700+ score puts Chase Freedom Unlimited well within reach. It earns 1.5% on all purchases, 3% on dining, and 5% on travel booked through Chase — with no annual fee. More importantly, it becomes the foundation of the Chase trifecta if you add a Sapphire card later.`,
        whyNotAlternatives:
          "A secured card at your stage is unnecessary. Discover it is a good card but caps rewards at 5% category spending. Chase Freedom Unlimited provides uncapped 1.5% everywhere, making it a better daily driver.",
        focusNow:
          'Apply and immediately set up full-balance autopay. Use for all everyday spending and review your eligibility for Chase Sapphire Preferred in 6–12 months once you see your credit profile develop.',
      }

    default:
      return {
        institution: 'capital_one',
        product: 'Capital One Platinum',
        headline: 'Start building credit with a no-fee card',
        why: 'A simple, no-annual-fee card to establish your credit file.',
        whyNotAlternatives: 'Other options require credit history.',
        focusNow: 'Pay on time every month to build your score.',
      }
  }
}
