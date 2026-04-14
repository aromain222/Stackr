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

    case 'emerging_optimizer': {
      // Chase for hybrid/wealth archetypes (ecosystem matters); Discover for digital/rewards
      // (higher approval tolerance, strong first-year Cashback Match).
      // Bug fix: why/whyNot/focusNow were previously always Chase text even when product was Discover.
      const useChase =
        archetype === 'traditional_hybrid' || archetype === 'early_wealth_starter'
      return {
        institution: useChase ? 'chase' : 'discover',
        product: useChase ? 'Chase Freedom Unlimited®' : 'Discover it® Cash Back',
        headline: 'Unlock a real rewards card with your solid history',
        why: useChase
          ? `Your payment history opens the door to real rewards. Chase Freedom Unlimited earns 1.5% on everything, 3% on dining, and 5% on Chase travel — no annual fee. More importantly, it anchors the Chase ecosystem: add a Sapphire card in 12–18 months and those points jump from 1¢ to 2.25¢+ each for travel. With ${incomeCtx}, this is a card worth holding for years.`
          : `Your consistent payments qualify you for cards that actually earn. Discover it Cash Back earns 5% on rotating quarterly categories (gas, groceries, Amazon, restaurants) and 1% everywhere else — no annual fee. Discover also matches every dollar of cashback you earn in year one, making the first 12 months especially strong. With ${incomeCtx}, the Cashback Match is a meaningful head start.`,
        whyNotAlternatives: useChase
          ? `Premium travel cards (Sapphire Reserve, Amex Gold) charge $250–$550/year and require 700+ scores to justify the fees. Citi Double Cash earns 2% flat but doesn't build toward a transferable points currency. Chase Freedom Unlimited earns less on flat spending but scales significantly once you add a Sapphire.`
          : `Chase Freedom Unlimited is the stronger long-term card but typically requires a 670+ score with clean history. Amex cards require more established credit. Discover's approval rate at your stage is meaningfully higher, and the first-year Cashback Match makes it competitive against higher-earning cards.`,
        focusNow: useChase
          ? `Apply, set up full-balance autopay immediately, and use this card for all everyday spending. Apply for Chase Freedom Flex (5% rotating categories, no annual fee) in 6 months — the two cards together earn more than either alone.`
          : `Apply and set up full-balance autopay before your first statement closes. Log into Discover and manually activate each quarter's bonus categories — it's required every 90 days and easy to miss. Keep utilization under 15% to grow both rewards and your score.`,
      }
    }

    case 'rewards_optimizer':
      // Branch 1: ideal path — pays in full + rewards-focused archetype → premium card
      if (
        answers.debtSituation === 'pays_in_full' &&
        (archetype === 'rewards_builder' || archetype === 'early_wealth_starter')
      ) {
        // Amex Gold for spend-heavy savers (4x dining/groceries offsets $250 fee quickly).
        // Chase Sapphire for everyone else (transferable points, stronger ecosystem breadth).
        const useAmex = answers.income === 'full_time_high' || answers.income === 'self_employed'
        return {
          institution: useAmex ? 'amex' : 'chase',
          product: useAmex ? 'American Express® Gold Card' : 'Chase Sapphire Preferred®',
          headline: 'Premium rewards for a premium credit profile',
          why: useAmex
            ? `Your 700+ score and full-payment discipline qualify you for the cards most people can't access. Amex Gold earns 4x at restaurants and U.S. supermarkets — two of the highest-spend categories for high earners. The $250 annual fee is offset by $120 dining credits and $120 Uber Cash annually, bringing the net cost to ~$10/year for people who use both. With ${incomeCtx}, the category bonuses alone justify it.`
            : `Your 700+ score and full-payment history open the premium tier. Chase Sapphire Preferred earns 3x on dining, 2x on travel, and transfers to 14 airline and hotel partners at 1:1 — points are worth 2–4¢ each through transfer partners, versus 1¢ for cash back. The $95 annual fee pays for itself with a single travel redemption. With ${incomeCtx}, this is the strongest entry point into transferable rewards.`,
          whyNotAlternatives:
            "Discover it and Capital One Quicksilver earn at flat rates that don't scale with higher spend. The opportunity cost grows every year: 1.5% flat versus 3–4x on key categories is a meaningful difference at $30k–$50k+ in annual spending. No-fee cards are the right starting point — premium cards are the logical upgrade once the discipline is established.",
          focusNow: useAmex
            ? `Apply, set up full-balance autopay, then immediately activate the $120 dining credit ($10/month at restaurants) and $120 Uber Cash to offset the fee. Never carry a balance — 28% APR would erase a full year of rewards in two months.`
            : `Apply, enroll in Chase Pay Yourself Back to redeem at 1.25¢/point for groceries and gas while building toward a travel redemption. Add Chase Freedom Unlimited as a companion for non-bonus spend — together they maximize every purchase.`,
        }
      }

      // Branch 2: carries a balance at 700+ → interest destroys rewards, warn clearly
      if (answers.debtSituation === 'carries_balance') {
        return {
          institution: 'discover',
          product: 'Discover it® Cash Back',
          headline: 'Strong credit, but interest cancels every dollar of rewards — clear the balance first',
          why: `Your 700+ score qualifies you for premium rewards cards, but carrying a balance at 20–28% APR means rewards are wiped out multiple times over. On a $2,000 balance at 24% APR, you pay ~$480 in interest annually — a $300 rewards yield means a net loss of $180. Discover it Cash Back earns real rewards with no annual fee, and no pressure to carry the card to a zero balance immediately.`,
          whyNotAlternatives: `Amex Gold ($250/year) and Chase Sapphire Preferred ($95/year) only make financial sense when you consistently pay in full. Annual fees plus revolving interest creates a guaranteed negative return. Your credit score is already there — clearing the balance is the only remaining condition.`,
          focusNow: `Set every card to autopay the full statement balance starting this billing cycle. Once you've cleared revolving debt and held three consecutive zero-balance statements, your profile qualifies for the premium stack. The score is ready — the habit is the last piece.`,
        }
      }

      // Branch 3: traditional_hybrid at 700+ → Chase Freedom Flex (5% categories, organized user)
      if (archetype === 'traditional_hybrid') {
        return {
          institution: 'chase',
          product: 'Chase Freedom Flex®',
          headline: '5% on rotating categories — the highest-earning no-fee card in the Chase lineup',
          why: `Your 700+ score and payment history qualify you for Chase's strongest no-fee card. Freedom Flex earns 5% on quarterly rotating categories (typically groceries, gas, Amazon, dining), 3% on dining and drugstores year-round, and 1% everywhere else. For someone comfortable activating categories each quarter, the annual cashback outperforms most flat-rate cards. With ${incomeCtx}, this fits your systematic approach to money.`,
          whyNotAlternatives: `Chase Freedom Unlimited earns more on flat spending but less during 5% quarters. If you're willing to spend 30 seconds activating categories four times a year, Freedom Flex earns meaningfully more annually. Amex Gold earns higher category rates but charges $250/year — the math only works at higher spending levels.`,
          focusNow: `Apply, activate the current quarter's bonus categories immediately, and set a recurring calendar reminder for the first day of each quarter. Set up full-balance autopay before your first statement closes.`,
        }
      }

      // Branch 4: fallback — strong credit but not optimally placed (digital_optimizer, foundation_builder)
      return {
        institution: 'chase',
        product: 'Chase Freedom Unlimited®',
        headline: 'Strong credit opens the door — build toward a full rewards stack',
        why: `A 700+ score puts Chase Freedom Unlimited well within reach. It earns 1.5% on all purchases, 3% on dining, and 5% on travel booked through Chase — no annual fee. More importantly, it anchors the Chase ecosystem: add a Sapphire card in 6–12 months and Freedom Unlimited points become transferable to airlines and hotels at 2.25¢+ each.`,
        whyNotAlternatives: `Citi Double Cash earns 2% flat but doesn't build toward a transferable points currency. Amex cards charge annual fees that require high spend to justify. Chase Freedom Unlimited provides optionality — it upgrades in value when you add a Sapphire, without any cost today.`,
        focusNow: `Apply, set up full-balance autopay immediately, and use for all spending. Begin tracking your Chase Ultimate Rewards balance — you're building toward a Chase Sapphire Preferred as your next card, which unlocks the full travel value of every point earned on Freedom Unlimited.`,
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
