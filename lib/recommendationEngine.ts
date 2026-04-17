import type {
  UserAnswers,
  StackOutput,
  Recommendation,
  AlternativeRecommendation,
  NextMove,
  AlternateOption,
  PlanningItem,
  PlanningLayer,
  SupportBlock,
  SupportContent,
  ComparisonRow,
  ArchetypeId,
  CreditStageId,
  InvestingReadinessId,
  InstitutionId,
  IncomeLevel,
  BankingPreference,
  FinancialPriority,
  EmergencyFund,
  DebtSituation,
} from './types'
import {
  calculateArchetypeScores,
  getPrimaryArchetype,
  getSecondaryArchetype,
} from './scoring'
import { determineCreditStage } from './credit'
import { calculateInvestingReadiness, getInvestingStyle, getInvestingRecommendation } from './investing'
import { generateRetirementGuidance } from './retirement'
import { getCreditRecommendation } from './credit'

// ─── Personalization label maps ────────────────────────────────────────────────

const INCOME_LABEL: Record<IncomeLevel, string> = {
  student: 'limited income as a student',
  part_time: 'part-time or irregular income',
  full_time_low: 'a steady income under $50k',
  full_time_mid: 'a solid income of $50k–$100k',
  full_time_high: 'a high income above $100k',
  self_employed: 'self-employment income',
}

const BANKING_LABEL: Record<BankingPreference, string> = {
  digital: 'digital-first banking',
  hybrid: 'a mix of digital and in-person',
  in_person: 'in-person branch access',
  rates_first: 'the best rates available',
}

const PRIORITY_LABEL: Record<FinancialPriority, string> = {
  build_credit: 'building credit',
  save_more: 'saving more',
  start_investing: 'starting to invest',
  manage_debt: 'getting out of debt',
  get_organized: 'getting organized',
}

const EF_LABEL: Record<EmergencyFund, string> = {
  none: 'no emergency savings yet',
  under_1mo: 'less than one month of expenses saved',
  one_3mo: 'one to three months of expenses saved',
  over_3mo: 'three or more months of expenses saved',
}

const ARCHETYPE_LABEL: Record<ArchetypeId, string> = {
  foundation_builder: 'Foundation Builder',
  digital_optimizer: 'Digital Optimizer',
  traditional_hybrid: 'Traditional Hybrid',
  rewards_builder: 'Rewards Builder',
  early_wealth_starter: 'Early Wealth Starter',
}

// ─── Checking recommendations ──────────────────────────────────────────────────

function getCheckingRecommendation(archetype: ArchetypeId, answers: UserAnswers): Recommendation {
  const income = INCOME_LABEL[answers.income]
  const banking = BANKING_LABEL[answers.bankingPreference]
  const priority = PRIORITY_LABEL[answers.priority]

  switch (archetype) {
    case 'foundation_builder':
      return {
        institution: 'capital_one',
        product: 'Capital One 360 Checking',
        headline: 'No fees, no minimums, no catch',
        why: `With ${income} and a focus on ${priority}, fee-free checking isn't a nice-to-have — it's the baseline. Capital One 360 charges no monthly fee, requires no minimum balance, and has no overdraft fees. Every dollar you'd otherwise pay in bank fees goes toward your foundation instead.`,
        whyNotAlternatives:
          'Chase Total Checking charges $12/month without $1,500+ balance or $500+ monthly direct deposit. Bank of America charges $12/month. SoFi requires direct deposit enrollment. Capital One 360 has zero conditions — open it, use it, pay nothing.',
        focusNow:
          'Open online today — takes 5 minutes, no minimum deposit required. Set up direct deposit from your employer to enable overdraft protection and early paycheck access.',
      }

    case 'digital_optimizer': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      const wantsSimple = answers.moneyStyle === 'simple_and_clear'
      if (noDD || wantsSimple) {
        return {
          institution: 'capital_one',
          product: 'Capital One 360 Checking',
          headline: 'No fees, no conditions — 4.25% savings APY with no direct deposit required',
          why: `You prefer ${banking}${noDD ? ' but your income doesn\'t flow through standard direct deposit' : ' and prefer keeping banking simple'}. Capital One 360 earns 4.25% APY on savings with zero conditions — no direct deposit required, no minimum balance. SoFi's 4.60% rate only activates with direct deposit; without it you'd earn 1.20%, which is worse than Capital One's unconditional rate.`,
          whyNotAlternatives:
            "SoFi's 4.60% savings rate requires direct deposit — without it, you earn 1.20%, making it the worse option here. Ally earns 4.20% with no conditions but has no branch or café footprint. Capital One's ~500 branch-and-café locations add occasional in-person flexibility at zero cost.",
          focusNow:
            'Open online in 5 minutes — no minimum deposit. The 4.25% savings rate applies from day one with no setup requirements. Link Capital One 360 Performance Savings to the same account to keep everything in one place.',
        }
      }
      return {
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        headline: 'Earn 0.50% APY on checking while savings earns 4.60%',
        why: `You prefer ${banking} and have ${income}. SoFi is the only mainstream account that pays meaningful yield on your checking balance, not just savings. Combined with the 4.60% savings APY when direct deposit is active, SoFi is a materially better place for idle cash than any traditional bank.`,
        whyNotAlternatives:
          'Chase pays $0 APY on checking. Capital One 360 is a solid no-fee account but earns nothing on the checking side. Ally is excellent for savings but splits your attention across two platforms. SoFi integrates both at the highest yield.',
        focusNow:
          'Open SoFi and enable direct deposit to unlock the 4.60% savings APY. Without direct deposit, the savings rate drops to 1.20% — the difference on $5,000 is $170/year.',
      }
    }

    case 'traditional_hybrid':
      return {
        institution: 'chase',
        product: 'Chase Total Checking',
        headline: '4,700+ branches and a best-in-class mobile app',
        why: `You want ${banking} — and no bank delivers that combination better than Chase. With the largest branch network in the U.S. and consistently top-rated mobile banking, you get full digital capability without giving up in-person access when you need it. With ${income}, you likely qualify to waive the monthly fee easily.`,
        whyNotAlternatives:
          'SoFi and Ally have zero branches. Capital One has select cafés, not full-service branches. Bank of America has branches but a weaker mobile product and fewer no-fee paths. Chase is the only bank that genuinely excels on both dimensions.',
        focusNow:
          'Open online or at a branch. The $12/month fee is waived with $500+ monthly direct deposit — set that up immediately. Download the Chase app and enable push notifications for every transaction.',
      }

    case 'rewards_builder':
      return {
        institution: 'discover',
        product: 'Discover Cashback Debit',
        headline: '1% cashback on debit purchases — most debit cards earn nothing',
        why: `You optimize every category of spending and your debit card shouldn't be an exception. With ${income} and a focus on ${priority}, Discover Cashback Debit earns 1% on up to $3,000 in monthly debit purchases — that's up to $360/year on spending you'd make anyway. No fees, no minimum, no conditions.`,
        whyNotAlternatives:
          'Chase, SoFi, and Capital One debit cards earn zero cashback on purchases. American Express does not offer a checking account. Discover is the only major bank offering debit cashback at scale with no annual fee.',
        focusNow:
          'Open and set as your primary everyday spending account. Use your rewards credit card for larger purchases and Discover Cashback Debit for everyday spend where credit isn\'t accepted.',
      }

    case 'early_wealth_starter': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      const prefersIntegrated = answers.retirement === '401k_with_match' || answers.retirement === '401k_no_match'
      if (prefersIntegrated && !noDD) {
        return {
          institution: 'schwab',
          product: 'Schwab Investor Checking',
          headline: 'Checking + brokerage under one login, unlimited ATM rebates worldwide',
          why: `With ${income} and ${EF_LABEL[answers.emergencyFund]}, your retirement accounts are already active — centralizing daily banking at Schwab puts your checking and investments in one dashboard. Unlimited worldwide ATM fee rebates mean zero cash-access friction, and the $0-fee account integrates directly with Schwab brokerage and your Roth IRA.`,
          whyNotAlternatives:
            "SoFi earns more on idle cash (4.60% vs Schwab's 0.45% with DD), but doesn't offer a full brokerage under the same login. Fidelity integrates similarly, but Schwab's checking is the stronger everyday banking product. If maximizing cash yield matters more than brokerage consolidation, SoFi is the right call instead.",
          focusNow:
            'Open Schwab Investor Checking — takes 10 minutes online, $0 minimum. Link your existing Schwab brokerage or open both simultaneously. Set up direct deposit for early paycheck access.',
        }
      }
      if (noDD) {
        return {
          institution: 'capital_one',
          product: 'Capital One 360 Checking',
          headline: 'No fees, 4.25% savings APY — no direct deposit required',
          why: `With ${income} and ${EF_LABEL[answers.emergencyFund]}, income that doesn\'t arrive as standard direct deposit means SoFi's 4.60% rate stays locked at 1.20%. Capital One 360 earns 4.25% APY on savings with zero conditions — no enrollment, no minimums — so every dollar works harder regardless of how your income arrives.`,
          whyNotAlternatives:
            "SoFi without direct deposit earns 1.20% on savings — materially worse than Capital One's unconditional 4.25%. Ally earns 4.20% with no conditions and is a valid alternative, but Capital One's ~500 branch-and-café footprint adds occasional in-person flexibility.",
          focusNow:
            'Open online in 5 minutes, no minimum deposit. Pair with Capital One 360 Performance Savings to get the 4.25% APY on your emergency fund automatically.',
        }
      }
      return {
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        headline: 'Your checking balance should earn — and with SoFi, it does',
        why: `With ${income} and ${EF_LABEL[answers.emergencyFund]}, optimizing every account matters. SoFi pays 0.50% APY on checking and 4.60% on savings with direct deposit — meaning the cash sitting in your account between paychecks earns real yield instead of nothing. Zero fees means zero drag on returns.`,
        whyNotAlternatives:
          "Traditional banks pay $0 on checking and charge $12–$15/month in fees. Chase is a better choice only if branch access is important to you. At your income and stage, SoFi's all-in-one yield optimization is the highest-value checking option.",
        focusNow:
          'Enable direct deposit to unlock the full 4.60% savings APY. Set up an auto-sweep rule to move anything above your monthly spending threshold into savings — every dollar above the buffer should be earning 4.60%.',
      }
    }
  }
}

// ─── Savings recommendations ───────────────────────────────────────────────────

function getSavingsRecommendation(archetype: ArchetypeId, answers: UserAnswers): Recommendation {
  const income = INCOME_LABEL[answers.income]
  const ef = EF_LABEL[answers.emergencyFund]

  switch (archetype) {
    case 'foundation_builder':
      return {
        institution: 'ally',
        product: 'Ally High-Yield Savings Account',
        headline: '4.20% APY with no minimum and no fees',
        why: `You have ${ef} and ${income}. The most important thing you can do with savings right now is put it somewhere that earns real yield and removes all friction. Ally pays 4.20% APY with no minimum balance and no monthly fees — and the "Savings Buckets" feature lets you label exactly what each dollar is for, which makes it easier to leave it there.`,
        whyNotAlternatives:
          'Chase Savings pays 0.01% APY — $1,000 there earns $0.10/year versus $42 at Ally. Traditional bank savings accounts exist to keep your money in their ecosystem, not to benefit you. Ally earns 420x more on the same balance.',
        focusNow:
          'Open with any amount — even $1. Set up a weekly auto-transfer from your Capital One checking. Create a "Emergency Fund" bucket. Even $25/week becomes $1,300 in a year.',
      }

    case 'digital_optimizer': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      if (noDD) {
        return {
          institution: 'ally',
          product: 'Ally High-Yield Savings Account',
          headline: '4.20% APY — no direct deposit required, no minimum balance',
          why: `SoFi's 4.60% savings rate requires direct deposit to unlock — without it you earn 1.20%. With ${income} and income that doesn't flow through standard direct deposit, Ally earns 4.20% APY with zero conditions. No enrollment, no requirements — full rate from day one regardless of how your income arrives.`,
          whyNotAlternatives:
            "SoFi without direct deposit earns 1.20% — far worse than Ally's unconditional 4.20%. Capital One Performance Savings earns 4.25% and is also valid here, but Ally's Savings Buckets make it easier to track multiple savings goals when income is irregular.",
          focusNow:
            'Open with any amount — even $1 starts the account. Use Savings Buckets to label incoming funds: Emergency Fund, Tax Reserve, Business Buffer. The structure matters more when income is variable.',
        }
      }
      return {
        institution: 'sofi',
        product: 'SoFi Savings (integrated with Checking)',
        headline: '4.60% APY — the highest available when paired with direct deposit',
        why: `SoFi's checking and savings are one integrated account. With ${income} and direct deposit active, your savings earns 4.60% APY — higher than Ally, Marcus, or any traditional bank. There's no friction between spending and saving because it's one login, one app, one dashboard.`,
        whyNotAlternatives:
          "Ally earns 4.20% — meaningfully lower than SoFi's 4.60% with direct deposit. Marcus is a clean savings product but doesn't integrate with checking. Opening a second app and a second relationship for marginally lower yield makes no sense at your optimization level.",
        focusNow:
          'Enable direct deposit — this is the unlock for the 4.60% rate. Use SoFi Vaults to tag savings by purpose: Emergency Fund, Travel, Next Investment. The structure makes it easier to grow each bucket.',
      }
    }

    case 'traditional_hybrid':
      return {
        institution: 'capital_one',
        product: 'Capital One 360 Performance Savings',
        headline: '4.25% APY with the convenience of Capital One — not Chase\'s 0.01%',
        why: `You value the Chase ecosystem for checking and branch access — but Chase Savings is a trap. It earns 0.01% APY. Capital One 360 Performance Savings earns 4.25% APY with no fees and no minimum, and you can link it to your Chase checking for easy transfers. Keep the convenience, capture the yield.`,
        whyNotAlternatives:
          'Chase Savings pays 0.01% APY. That\'s $0.10/year on $1,000. Capital One pays $42.50 on that same $1,000. This is not a close comparison. SoFi Savings is higher yield but requires switching your banking ecosystem — unnecessary if you value Chase branches.',
        focusNow:
          'Open Capital One 360 Performance Savings and immediately transfer your existing savings balance there. Set up a recurring transfer from Chase checking on payday. Chase for spending, Capital One for growing.',
      }

    case 'rewards_builder':
      return {
        institution: 'amex',
        product: 'American Express High-Yield Savings Account',
        headline: '4.35% APY — no fees, no minimums, FDIC insured',
        why: `With ${income}, your emergency fund should be earning real yield — not sitting idle in a traditional bank account earning 0.01%. Amex High-Yield Savings earns 4.35% APY with no fees, no minimum balance, and no conditions. That's $43.50/year on $1,000 versus $0.10 at Chase.`,
        whyNotAlternatives:
          "Chase Savings pays 0.01% APY — the difference on $10,000 is $434/year. Ally is a strong alternative at 4.20% but slightly lower. Amex HYSA requires no existing Amex relationship — it's open to anyone and earns from day one with no hoops to jump through.",
        focusNow:
          'Open Amex HYSA online. Transfer your full emergency fund there today — every month you delay in a low-yield account is real money forfeited. Transfers to/from external accounts settle in 1–3 business days.',
      }

    case 'early_wealth_starter': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      if (noDD) {
        return {
          institution: 'ally',
          product: 'Ally High-Yield Savings Account',
          headline: '4.20% APY with no conditions — your emergency fund earns from day one',
          why: `With ${ef} and irregular income, Ally's 4.20% APY with zero conditions is the right foundation. SoFi's 4.60% requires direct deposit — without it you earn 1.20%. Ally earns the full rate immediately with no requirements, and Savings Buckets make it easy to separate your emergency fund, tax reserve, and investing buffer when income is variable.`,
          whyNotAlternatives:
            "SoFi without direct deposit earns 1.20% — far worse than Ally's 4.20%. Capital One 360 Performance Savings earns 4.25% and is a valid alternative, but Ally's goal-bucketing feature is more useful for managing irregular cash flow across multiple purposes.",
          focusNow:
            'Open and create three Savings Buckets: Emergency Fund (3–6 months expenses), Tax Reserve (if self-employed: ~25% of income), Investing Buffer (excess above EF target flows to Roth IRA). The structure makes irregular income manageable.',
        }
      }
      return {
        institution: 'sofi',
        product: 'SoFi Savings (integrated with Checking)',
        headline: '4.60% APY on your emergency fund — same platform, zero friction',
        why: `With ${ef} and ${income}, your savings strategy is straightforward: keep your emergency fund earning maximum yield, and deploy everything above it to tax-advantaged investing. SoFi pays 4.60% APY on savings with direct deposit — the same platform as your checking, so sweeping excess cash into the high-yield savings bucket takes seconds, not transfers between banks.`,
        whyNotAlternatives:
          "Ally earns 4.20% — lower yield and a second app to manage. Since your checking is already at SoFi, moving savings elsewhere costs yield and adds friction without any benefit. The integrated view of checking + savings in one dashboard is materially better than managing two platforms for a $40/year yield difference.",
        focusNow:
          'Enable direct deposit to unlock the full 4.60% savings APY. Set a target savings balance: 3–6 months of monthly expenses. Every dollar above that threshold should flow to your Roth IRA or taxable brokerage at Fidelity — savings rate is not investing rate.',
      }
    }
  }
}

// ─── Next moves generation ─────────────────────────────────────────────────────

function generateNextMoves(
  archetype: ArchetypeId,
  creditStage: CreditStageId,
  investingReadiness: InvestingReadinessId,
  answers: UserAnswers
): NextMove[] {
  const moves: NextMove[] = []

  switch (archetype) {
    case 'foundation_builder':
      moves.push({
        id: 'checking',
        title: 'Open Capital One 360 Checking',
        description: 'No fees, no minimum, no conditions. Takes 5 minutes online. Set up direct deposit immediately.',
        priority: 'high',
        timeframe: 'This week',
      })
      moves.push({
        id: 'savings',
        title: 'Open Ally High-Yield Savings',
        description: 'Set up a weekly auto-transfer — even $25/week. Create an "Emergency Fund" bucket. Leave it alone.',
        priority: 'high',
        timeframe: 'This week',
      })
      if (creditStage === 'no_credit') {
        moves.push({
          id: 'credit',
          title: 'Apply for a secured credit card',
          description: 'Discover it® Secured or Capital One Platinum Secured. Use it for one small purchase monthly, pay in full.',
          priority: 'high',
          timeframe: 'Next 2 weeks',
        })
      } else {
        moves.push({
          id: 'credit',
          title: 'Set every card to autopay the full statement balance',
          description: 'Log into each card account and enable full-balance autopay. This eliminates late fees and interest permanently.',
          priority: 'high',
          timeframe: 'Today',
        })
      }
      if (answers.debtSituation === 'carries_balance') {
        moves.push({
          id: 'debt',
          title: 'Pay more than the minimum on every card this billing cycle',
          description: 'Identify the highest-rate balance and direct any extra cash there. Interest is compounding against you — every dollar above the minimum accelerates payoff and saves more than any savings rate can earn.',
          priority: 'medium',
          timeframe: 'Next billing cycle',
        })
      } else if (answers.debtSituation === 'occasionally') {
        moves.push({
          id: 'autopay',
          title: 'Set all cards to autopay the full statement balance',
          description: 'Occasional balance carrying means occasional interest charges. Full-balance autopay eliminates that permanently and protects your score from missed payments.',
          priority: 'medium',
          timeframe: 'Today',
        })
      } else {
        moves.push({
          id: 'retirement',
          title: 'Open a Roth IRA at Fidelity — start with any amount',
          description: 'Once your emergency fund is funded, a Roth IRA is the highest-leverage next step. $100/month at 25 becomes ~$350,000 by 65 at average returns. Fidelity has no minimum and no fees.',
          priority: 'medium',
          timeframe: 'Next month',
        })
      }
      break

    case 'digital_optimizer':
      moves.push({
        id: 'sofi',
        title: 'Open SoFi Checking + Savings',
        description: 'One account, one app, 10–15 minutes online. No minimum deposit required.',
        priority: 'high',
        timeframe: 'Today',
      })
      moves.push({
        id: 'dd',
        title: 'Enable direct deposit to unlock 4.60% APY',
        description: 'Without direct deposit, savings earns 1.20%. This single step is worth $170+/year on a $5,000 balance.',
        priority: 'high',
        timeframe: 'Next paycheck',
      })
      if (creditStage !== 'no_credit') {
        moves.push({
          id: 'chase',
          title: 'Apply for Chase Freedom Unlimited if score is 670+',
          description: '1.5% unlimited cashback, 3% on dining. No annual fee. Becomes more valuable when paired with a Sapphire card.',
          priority: 'medium',
          timeframe: 'This month',
        })
      }
      moves.push({
        id: 'vaults',
        title: 'Set up SoFi Vaults for savings goals',
        description: 'Tag each savings dollar by purpose — Emergency Fund, Travel, Down Payment. Automate contributions on payday.',
        priority: 'low',
        timeframe: 'This week',
      })
      break

    case 'traditional_hybrid':
      moves.push({
        id: 'chase',
        title: 'Open Chase Total Checking',
        description: 'Apply online or at a branch. Set up $500+ monthly direct deposit to waive the $12/month fee.',
        priority: 'high',
        timeframe: 'This week',
      })
      moves.push({
        id: 'savings',
        title: 'Open Capital One 360 Performance Savings',
        description: 'Move your savings balance here immediately. 4.25% APY vs Chase\'s 0.01% — same convenience, 425x the yield.',
        priority: 'high',
        timeframe: 'This week',
      })
      moves.push({
        id: 'card',
        title: 'Apply for Chase Freedom Flex',
        description: '5% cashback on rotating quarterly categories, 3% on dining. No annual fee. Works best in the Chase ecosystem.',
        priority: 'medium',
        timeframe: 'This month',
      })
      moves.push({
        id: 'autosave',
        title: 'Enroll in Chase Autosave',
        description: 'Automatically transfers a fixed amount to savings on a schedule you set. No manual effort after setup.',
        priority: 'low',
        timeframe: 'This week',
      })
      break

    case 'rewards_builder':
      moves.push({
        id: 'autopay',
        title: 'Set every card to full-balance autopay immediately',
        description: 'Interest on any rewards card destroys every dollar earned. Full-balance autopay is non-negotiable.',
        priority: 'high',
        timeframe: 'Today',
      })
      moves.push({
        id: 'amex-savings',
        title: 'Open Amex High-Yield Savings at 4.35% APY',
        description: 'Move your full emergency fund there today. Every month in a low-yield account is forfeited yield.',
        priority: 'high',
        timeframe: 'This week',
      })
      moves.push({
        id: 'activate',
        title: 'Activate quarterly bonus categories on all cards',
        description: 'Chase Freedom and Discover both require manual activation each quarter. Set a calendar reminder for Q1–Q4.',
        priority: 'high',
        timeframe: 'Start of each quarter',
      })
      moves.push({
        id: 'tracking',
        title: 'Track all rewards balances in one place',
        description: 'Use Award Wallet or a spreadsheet to track points, cashback, and expiration dates across all cards.',
        priority: 'low',
        timeframe: 'This month',
      })
      break

    case 'early_wealth_starter':
      moves.push({
        id: '401k',
        title: answers.retirement === '401k_with_match'
          ? 'Verify you\'re capturing the full employer match'
          : 'Open a Roth IRA at Fidelity — $0 minimum, no fees',
        description: answers.retirement === '401k_with_match'
          ? 'Check your HR portal. Uncaptured employer match is a 50–100% guaranteed return you\'re forfeiting every paycheck.'
          : 'Select a target-date fund or FZROX. Contribute $583/month to hit the $7,000 annual limit.',
        priority: 'high',
        timeframe: 'Today',
      })
      moves.push({
        id: 'roth',
        title: 'Max your Roth IRA contribution for this tax year',
        description: 'The 2024 limit is $7,000. Every year you don\'t max it is a tax-free compounding year you can\'t recover.',
        priority: 'high',
        timeframe: 'This week',
      })
      moves.push({
        id: 'sofi-savings',
        title: 'Enable direct deposit on SoFi to unlock 4.60% savings APY',
        description: 'Without direct deposit, SoFi savings earns 1.20%. This one step is worth $170+/year on a $5,000 balance. Your emergency fund should be working harder.',
        priority: 'medium',
        timeframe: 'This week',
      })
      moves.push({
        id: 'taxable',
        title: 'If 401k + Roth IRA are maxed, open a taxable brokerage',
        description: 'At Fidelity — invest in FZROX (0% expense ratio, total market). No tax advantages but no contribution limits.',
        priority: 'low',
        timeframe: 'Next month',
      })
      break
  }

  return moves
}

// ─── Archetype explanation ─────────────────────────────────────────────────────

function generateExplanation(
  primary: ArchetypeId,
  secondary: ArchetypeId,
  answers: UserAnswers
): string {
  const income = INCOME_LABEL[answers.income]
  const ef = EF_LABEL[answers.emergencyFund]
  const priority = PRIORITY_LABEL[answers.priority]
  const banking = BANKING_LABEL[answers.bankingPreference]

  switch (primary) {
    case 'foundation_builder':
      return `With ${income}, ${ef}, and a focus on ${priority}, you're at the start of building a financial base that everything else will sit on top of. The most valuable moves right now aren't about optimization — they're about eliminating fees, establishing credit history, and building consistent savings habits. The ${ARCHETYPE_LABEL[secondary]} element of your profile means you'll naturally graduate to more sophisticated products in 12–18 months once the foundation is solid.`

    case 'digital_optimizer':
      return `With ${income}, a preference for ${banking}, and a focus on ${priority}, your profile is built for efficiency. You don't need branches or paper statements — you need yield, integration, and zero waste. Every dollar you leave in a low-yield account or spend on bank fees is a dollar working against you. Your ${ARCHETYPE_LABEL[secondary]} tendencies mean you also value some structure — which is why this stack pairs high-yield automation with a focused credit card strategy.`

    case 'traditional_hybrid':
      return `You want ${banking}, which narrows the options significantly — and Chase is the clear answer. With ${income} and a focus on ${priority}, you need a bank that won't disappear when the app is down or when you need to deposit cash. Your ${ARCHETYPE_LABEL[secondary]} profile means you're also open to optimization — which is why we pair Chase checking (branch access, best app) with Capital One savings (4.25% APY, not Chase's 0.01%).`

    case 'rewards_builder':
      return `With ${income}, strong credit, and the discipline to pay in full, you're positioned to extract real value from your daily spending. ${ef} means you have the stability to run premium cards without financial risk — the only variable that matters. Your ${ARCHETYPE_LABEL[secondary]} tendencies confirm you're optimizing across multiple dimensions, not just rewards. The math only works if you never carry a balance — and this stack is designed for exactly that discipline.`

    case 'early_wealth_starter':
      return `With ${income}, ${ef}, and a focus on ${priority}, you're at the inflection point where financial decisions begin to compound exponentially. A dollar deployed into a Roth IRA today is worth 4–5x more than the same dollar at 35, due to compound growth. Your ${ARCHETYPE_LABEL[secondary]} profile means you also care about efficiency and yield on your cash — which is why this stack maximizes yield at every layer while pointing excess capital toward tax-advantaged investing.`
  }
}

// ─── Alternate option ──────────────────────────────────────────────────────────
// Alternate option selection is answer-aware: it considers the specific tradeoff
// the user is most likely to face given their banking preference, income, emergency
// fund status, and credit situation — not just their archetype.

function getAlternateOption(archetype: ArchetypeId, answers: UserAnswers): AlternateOption {
  switch (archetype) {
    case 'foundation_builder': {
      // If they want any in-person access, Chase is the relevant tradeoff
      if (answers.bankingPreference === 'in_person' || answers.bankingPreference === 'hybrid') {
        return {
          institution: 'chase',
          product: 'Chase Total Checking + separate HYSA',
          reason: 'If branch access is a genuine requirement, Chase is the answer: 4,700+ locations and the best mobile app in traditional banking. The $12/month fee is waived with $500+ direct deposit. The critical caveat: Chase Savings pays just 0.01% APY — pair it immediately with a Capital One 360 Performance Savings account (4.25%, no conditions) for savings yield.',
        }
      }
      // Default: SoFi as a single-platform upgrade
      return {
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        reason: 'If you can route your paycheck through SoFi, you\'ll earn 4.60% on savings and 0.50% on checking with zero fees — all in one app instead of two. The only condition: the 4.60% savings rate requires direct deposit. Without it, you earn 1.20%, which is lower than Ally\'s no-condition rate.',
      }
    }

    case 'digital_optimizer': {
      // If EF is thin, they may not be ready to set up DD at a new bank yet
      const efThin = answers.emergencyFund === 'none' || answers.emergencyFund === 'under_1mo'
      if (efThin) {
        return {
          institution: 'capital_one',
          product: 'Capital One 360 Checking + Performance Savings',
          reason: 'If you\'re not yet ready to switch direct deposit to a new bank, Capital One 360 earns 4.25% on savings with zero conditions — no direct deposit required, no minimum balance. The yield gap vs. SoFi with DD is $20/year on $5,000. You also get ~500 branch/café locations as a backup.',
        }
      }
      return {
        institution: 'ally',
        product: 'Ally Online Savings + Interest Checking',
        reason: 'If you prefer keeping checking and savings at a bank built specifically for savings (rather than SoFi\'s all-in-one model), Ally earns 4.20% on savings with no conditions and 0.25% on checking — no account to combine. The tradeoff: 4.20% vs. SoFi\'s 4.60% with DD is $20/year on $5,000, and no branches either way.',
      }
    }

    case 'traditional_hybrid': {
      // Lower income users face real fee risk with Chase
      const feeRisk = answers.income === 'student' || answers.income === 'part_time' || answers.income === 'full_time_low'
      if (feeRisk) {
        return {
          institution: 'capital_one',
          product: 'Capital One 360 Checking + Performance Savings',
          reason: 'If Chase\'s $12/month fee is a real concern at your current income, Capital One 360 is free with zero conditions — and has ~500 branch and Café locations for occasional in-person needs. You trade the Chase card ecosystem (Freedom, Sapphire, Ultimate Rewards) for zero fee risk and 4.25% APY on savings without any direct deposit requirement.',
        }
      }
      return {
        institution: 'capital_one',
        product: 'Capital One 360 Checking + Performance Savings',
        reason: 'If you want one banking relationship instead of two, Capital One 360 handles both checking (free, no conditions) and savings (4.25% APY) in one place. You give up Chase\'s branch density and the Freedom card ecosystem, but gain simplicity and zero fee risk even if your income changes.',
      }
    }

    case 'rewards_builder': {
      // Strong credit → Chase trifecta for travel points is a meaningful upgrade path
      const strongCredit = answers.creditSituation === 'score_700_plus' || answers.creditSituation === 'multiple_on_time'
      if (strongCredit) {
        return {
          institution: 'chase',
          product: 'Chase Sapphire Preferred + Freedom Unlimited + Freedom Flex',
          reason: 'If transferable travel points appeal more than flat cash back, the Chase trifecta earns 1.5–5x on every category and converts points to airline and hotel partners at 1.5–4¢ each — compared to 1¢ for cash back. The system requires three cards and a $95 Sapphire annual fee, but at $30k+/year in spending the value gap grows substantially.',
        }
      }
      // Thinner credit → focus on building the credit path first
      return {
        institution: 'ally',
        product: 'Ally Online Savings (for the emergency reserve)',
        reason: 'While you build your credit card stack, the emergency fund needs to earn real yield. Ally earns 4.20% with no conditions and offers Savings Buckets for goal tracking — cleaner separation of the cash reserve from spending funds. Once the EF is funded, all surplus flows to the card rewards strategy.',
      }
    }

    case 'early_wealth_starter': {
      // High earners with 401k match → Amex premium ecosystem is worth exploring
      const highEarnerWithMatch = (answers.income === 'full_time_high' || answers.income === 'self_employed') && answers.retirement === '401k_with_match'
      if (highEarnerWithMatch) {
        return {
          institution: 'amex',
          product: 'Amex High-Yield Savings + Platinum Card',
          reason: 'If you spend heavily on travel, the Amex ecosystem consolidates premium savings (4.35% HYSA, no conditions) with the Platinum Card\'s $1,500+ in travel credits — which offset the $695 annual fee for high spenders. Works best at $6,000+/year in travel and dining. The yield on savings is slightly lower than SoFi with DD (4.35% vs. 4.60%) but there are no conditions.',
        }
      }
      // Default: Fidelity CMA as a single-platform option for investing-focused users
      return {
        institution: 'fidelity',
        product: 'Fidelity Cash Management Account',
        reason: 'If fewer platforms and one login matters, Fidelity\'s CMA handles uninvested cash alongside your Roth IRA and brokerage — one institution, one app, one tax document. The tradeoff: cash yield is lower than SoFi\'s 4.60% (SoFi\'s rate is higher), but you eliminate the friction of transferring between a bank and an investment account.',
      }
    }
  }
}

// ─── Checking alternatives ────────────────────────────────────────────────────

function getCheckingAlternatives(
  archetype: ArchetypeId,
  secondary: ArchetypeId,
  answers: UserAnswers
): AlternativeRecommendation[] {
  const alts: AlternativeRecommendation[] = []

  switch (archetype) {
    case 'foundation_builder':
      alts.push({
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        headline: '4.60% on savings + 0.50% on checking, one app',
        tradeoff: 'Requires direct deposit to unlock the full savings rate — drops to 1.20% without it',
        whenItWins: 'Once your paycheck routes through SoFi, every idle dollar earns the top rate automatically',
        isUpgradePath: true,
      })
      if (answers.bankingPreference === 'in_person' || answers.bankingPreference === 'hybrid') {
        alts.push({
          institution: 'chase',
          product: 'Chase Total Checking',
          headline: '4,700+ branches and the top-rated banking app',
          tradeoff: '$12/month fee unless $500+ monthly direct deposit is active',
          whenItWins: 'When branch access is a genuine, ongoing requirement — Chase is the only bank that excels at both',
          isUpgradePath: false,
        })
      }
      break

    case 'digital_optimizer': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      const wantsSimple = answers.moneyStyle === 'simple_and_clear'
      if (noDD || wantsSimple) {
        // Primary is Capital One — SoFi is upgrade path, Ally is no-condition alt
        alts.push({
          institution: 'sofi',
          product: 'SoFi Checking & Savings',
          headline: '4.60% savings APY — the upgrade once direct deposit is available',
          tradeoff: 'Rate drops to 1.20% without direct deposit — the gap vs. Capital One depends entirely on DD eligibility',
          whenItWins: 'Once your income reliably flows through direct deposit — SoFi\'s rate advantage is worth the switch',
          isUpgradePath: true,
        })
        alts.push({
          institution: 'ally',
          product: 'Ally Interest Checking',
          headline: '4.20% savings + 0.25% checking, no-conditions savings-first bank',
          tradeoff: 'Slightly lower savings APY than Capital One (4.20% vs 4.25%) and no branch access',
          whenItWins: 'If you prefer a bank purpose-built around savings tooling (Savings Buckets) with no minimum requirements',
          isUpgradePath: false,
        })
      } else {
        alts.push({
          institution: 'capital_one',
          product: 'Capital One 360 Checking',
          headline: 'Zero fees, zero conditions, 4.25% savings APY',
          tradeoff: '4.25% savings vs SoFi\'s 4.60% — the yield gap is ~$20/year on $5,000',
          whenItWins: 'If you\'re not ready to switch direct deposit to a new bank, Capital One earns well with no requirements',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'ally',
          product: 'Ally Interest Checking',
          headline: '4.20% savings + 0.25% checking, purpose-built for savers',
          tradeoff: 'Slightly lower APY than SoFi and a separate savings account vs. the integrated SoFi model',
          whenItWins: 'If you prefer a bank purpose-built around savings tooling (Savings Buckets) over an all-in-one platform',
          isUpgradePath: false,
        })
      }
      break
    }

    case 'traditional_hybrid':
      alts.push({
        institution: 'capital_one',
        product: 'Capital One 360 Checking',
        headline: 'Free forever, ~500 locations, 4.25% savings APY',
        tradeoff: 'Smaller branch network than Chase (500 vs 4,700) and no premium card ecosystem',
        whenItWins: "When Chase's $12/month fee is a real concern — Capital One is free with zero conditions",
        isUpgradePath: false,
      })
      alts.push({
        institution: 'bank_of_america',
        product: 'Bank of America Advantage Plus',
        headline: '3,900+ branches — Preferred Rewards boosts card earnings 25–75%',
        tradeoff: 'Same 0.01% savings APY as Chase — requires a separate HYSA; Preferred Rewards requires $20k+ in deposits',
        whenItWins: 'If you already have significant BofA balances and want credit card rewards amplified through Preferred Rewards',
        isUpgradePath: false,
      })
      break

    case 'rewards_builder':
      alts.push({
        institution: 'capital_one',
        product: 'Capital One 360 Checking',
        headline: 'Zero fees, 4.25% savings — no debit cashback but strong ecosystem',
        tradeoff: 'No 1% debit cashback like Discover — but 4.25% savings APY earns more on idle cash',
        whenItWins: 'If savings yield on your cash balance matters more than cashback on debit spending',
        isUpgradePath: false,
      })
      alts.push({
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        headline: '0.50% on checking + 4.60% on savings with direct deposit',
        tradeoff: 'No debit cashback — earns yield on balance instead of rewards on transactions',
        whenItWins: 'If you want every idle dollar earning something — checking and savings both — over debit cashback',
        isUpgradePath: false,
      })
      break

    case 'early_wealth_starter': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      const prefersIntegrated = answers.retirement === '401k_with_match' || answers.retirement === '401k_no_match'
      if (prefersIntegrated && !noDD) {
        // Primary is Schwab — Fidelity is similar integration alt, SoFi is high-yield alt
        alts.push({
          institution: 'fidelity',
          product: 'Fidelity Cash Management Account',
          headline: 'Checking + Roth IRA + brokerage under one Fidelity login',
          tradeoff: 'Lower everyday cash yield than SoFi — optimized for investment consolidation, not maximum APY',
          whenItWins: 'If your Roth IRA and brokerage are already at Fidelity — one login for everything simplifies tracking',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'sofi',
          product: 'SoFi Checking & Savings',
          headline: '4.60% savings + 0.50% checking — highest yield option',
          tradeoff: 'No brokerage integration — optimizes for cash yield, not investment consolidation',
          whenItWins: 'If maximizing yield on idle cash matters more than having checking and brokerage under one roof',
          isUpgradePath: false,
        })
      } else if (noDD) {
        // Primary is Capital One
        alts.push({
          institution: 'ally',
          product: 'Ally Interest Checking',
          headline: '4.20% savings + 0.25% checking, Savings Buckets for goal tracking',
          tradeoff: 'Slightly lower savings APY than Capital One (4.20% vs 4.25%) — no branch access',
          whenItWins: 'If goal-labeled savings buckets matter more than squeezing out the last 0.05% APY',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'sofi',
          product: 'SoFi Checking & Savings',
          headline: '4.60% savings APY — the upgrade once direct deposit is available',
          tradeoff: 'Rate drops to 1.20% without direct deposit — only worth switching once DD is reliably set up',
          whenItWins: 'Once your primary income flows through direct deposit — 4.60% is the best available rate',
          isUpgradePath: true,
        })
      } else {
        // Default: Primary is SoFi
        alts.push({
          institution: 'schwab',
          product: 'Schwab Investor Checking',
          headline: 'Unlimited worldwide ATM rebates + brokerage in one login',
          tradeoff: 'Lower savings yield than SoFi — Schwab shines on investing integration and travel, not APY',
          whenItWins: 'If you travel frequently or want your brokerage and checking under a single Schwab login',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'fidelity',
          product: 'Fidelity Cash Management Account',
          headline: 'Checking + Roth IRA + brokerage in one login',
          tradeoff: 'Lower cash yield than SoFi — optimized for investment integration, not maximum APY',
          whenItWins: 'If having your daily cash alongside your Roth IRA and brokerage in one place matters more than maximizing APY',
          isUpgradePath: false,
        })
      }
      break
    }
  }

  // Cap at 2 — secondary archetype ranking already baked into order above
  void secondary
  return alts.slice(0, 2)
}

// ─── Savings alternatives ─────────────────────────────────────────────────────

function getSavingsAlternatives(
  archetype: ArchetypeId,
  secondary: ArchetypeId,
  answers: UserAnswers
): AlternativeRecommendation[] {
  const alts: AlternativeRecommendation[] = []

  switch (archetype) {
    case 'foundation_builder':
      alts.push({
        institution: 'capital_one',
        product: 'Capital One 360 Performance Savings',
        headline: '4.25% APY — slightly higher than Ally, same zero conditions',
        tradeoff: 'No Savings Buckets feature; slightly higher rate than Ally',
        whenItWins: 'If you already use Capital One for checking and want your savings at the same bank',
        isUpgradePath: false,
      })
      alts.push({
        institution: 'sofi',
        product: 'SoFi Savings (integrated with Checking)',
        headline: '4.60% APY — highest available when direct deposit is active',
        tradeoff: 'Requires switching direct deposit to SoFi — rate drops to 1.20% without it',
        whenItWins: 'Once your paycheck routes through SoFi, your savings earns the highest no-fee rate automatically',
        isUpgradePath: true,
      })
      break

    case 'digital_optimizer': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      if (noDD) {
        // Primary is Ally — Capital One is marginal-rate alt, SoFi is upgrade path
        alts.push({
          institution: 'capital_one',
          product: 'Capital One 360 Performance Savings',
          headline: '4.25% APY — no conditions, marginally higher than Ally',
          tradeoff: '4.25% vs Ally\'s 4.20% — same zero-condition structure, no Savings Buckets feature',
          whenItWins: 'If you already use Capital One for checking and want savings at the same bank',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'sofi',
          product: 'SoFi Savings (integrated with Checking)',
          headline: '4.60% APY — the best rate, but only with direct deposit active',
          tradeoff: 'Rate drops to 1.20% without direct deposit — only worth it once DD is reliably set up',
          whenItWins: 'Once your income flows through direct deposit consistently — 4.60% vs 4.20% is worth the switch',
          isUpgradePath: true,
        })
      } else {
        alts.push({
          institution: 'ally',
          product: 'Ally Online Savings',
          headline: '4.20% APY — no conditions, Savings Buckets for goal tracking',
          tradeoff: '4.20% vs SoFi\'s 4.60% — $20/year less on $5,000, but no direct deposit required',
          whenItWins: 'If you prefer a dedicated savings bank with named goal buckets and no strings attached to the rate',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'capital_one',
          product: 'Capital One 360 Performance Savings',
          headline: '4.25% APY — no conditions, between Ally and SoFi',
          tradeoff: 'Lower yield than SoFi with DD, no integrated checking like SoFi',
          whenItWins: 'If you want competitive yield without switching your direct deposit away from your current bank',
          isUpgradePath: false,
        })
      }
      break
    }

    case 'traditional_hybrid':
      alts.push({
        institution: 'amex',
        product: 'American Express High-Yield Savings',
        headline: '4.35% APY — slightly higher than Capital One, same no conditions',
        tradeoff: 'Savings-only (no checking) — transfers to/from external accounts take 1–3 days',
        whenItWins: 'If you already have an Amex relationship or want to add a high-yield savings account without switching any checking setup',
        isUpgradePath: false,
      })
      alts.push({
        institution: 'sofi',
        product: 'SoFi Savings (integrated with Checking)',
        headline: '4.60% APY — highest rate, but requires moving away from Chase',
        tradeoff: 'No branches — requires switching direct deposit and giving up the Chase ecosystem',
        whenItWins: 'If you decide branch access matters less than maximum yield and want to consolidate onto one platform',
        isUpgradePath: true,
      })
      break

    case 'rewards_builder':
      alts.push({
        institution: 'ally',
        product: 'Ally Online Savings',
        headline: '4.20% APY — Savings Buckets for tracking multiple goals',
        tradeoff: '4.20% vs Amex\'s 4.35% — $7.50/year less on $5,000',
        whenItWins: 'If you want labeled savings goals (Emergency Fund, Travel, Down Payment) in a single account without opening multiple accounts',
        isUpgradePath: false,
      })
      alts.push({
        institution: 'marcus',
        product: 'Marcus by Goldman Sachs High-Yield Savings',
        headline: '4.10% APY — Goldman Sachs brand, zero conditions, zero friction',
        tradeoff: '4.10% vs Amex\'s 4.35% — slightly lower yield, but Goldman Sachs name carries institutional trust',
        whenItWins: 'If brand trust and simplicity matter and you want a completely no-frills savings experience',
        isUpgradePath: false,
      })
      break

    case 'early_wealth_starter': {
      const noDD = answers.paymentFrequency === 'irregular_cash' || answers.paymentFrequency === 'business_income'
      if (noDD) {
        // Primary is Ally
        alts.push({
          institution: 'capital_one',
          product: 'Capital One 360 Performance Savings',
          headline: '4.25% APY — no conditions, marginally higher than Ally',
          tradeoff: '4.25% vs Ally\'s 4.20% — same zero-condition structure, no Savings Buckets feature',
          whenItWins: 'If you already have Capital One checking and want savings at the same institution',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'sofi',
          product: 'SoFi Savings (integrated with Checking)',
          headline: '4.60% APY — upgrade once direct deposit is available',
          tradeoff: 'Rate drops to 1.20% without direct deposit — not worth switching until DD is reliably set up',
          whenItWins: 'Once your primary income flows through direct deposit — 4.60% is the best available no-fee rate',
          isUpgradePath: true,
        })
      } else {
        alts.push({
          institution: 'ally',
          product: 'Ally Online Savings',
          headline: '4.20% APY — no conditions, Savings Buckets',
          tradeoff: '4.20% vs SoFi\'s 4.60% — $20/year less on $5,000, but no direct deposit required',
          whenItWins: 'If you prefer keeping banking and investing on separate platforms with clean separation',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'amex',
          product: 'American Express High-Yield Savings',
          headline: '4.35% APY — no conditions, pairs with any checking account',
          tradeoff: 'Lower yield than SoFi with DD, savings-only (no checking product)',
          whenItWins: 'If you want a standalone savings account with no conditions that pairs cleanly with any bank',
          isUpgradePath: false,
        })
      }
      break
    }
  }

  void secondary
  return alts.slice(0, 2)
}

// ─── Credit alternatives ──────────────────────────────────────────────────────

function getCreditAlternatives(
  creditStage: CreditStageId,
  archetype: ArchetypeId,
  answers: UserAnswers
): AlternativeRecommendation[] {
  const alts: AlternativeRecommendation[] = []
  const primaryIsDiscover = answers.bankingPreference === 'digital'
  const primaryIsCapOne = !primaryIsDiscover
  const paysInFull = answers.debtSituation === 'pays_in_full'
  const carriesBalance = answers.debtSituation === 'carries_balance'
  const highIncome = answers.income === 'full_time_high' || answers.income === 'self_employed'

  switch (creditStage) {
    case 'no_credit':
      if (primaryIsDiscover) {
        alts.push({
          institution: 'capital_one',
          product: 'Capital One Platinum Secured Card',
          headline: 'Lower approval barrier, same credit-building result',
          tradeoff: 'No rewards while building — but Capital One is more lenient with first-time applicants',
          whenItWins: 'If Discover declines your application — apply here immediately as the backup',
          isUpgradePath: false,
        })
      } else {
        alts.push({
          institution: 'discover',
          product: 'Discover it® Secured Credit Card',
          headline: '2% cashback at restaurants and gas while building credit',
          tradeoff: 'Slightly higher approval bar than Capital One, but earns rewards from day one',
          whenItWins: 'If you prefer digital banking and want to earn rewards even during the credit-building phase',
          isUpgradePath: false,
        })
      }
      alts.push({
        institution: 'discover',
        product: 'Discover it® Cash Back',
        headline: '5% rotating categories — the first unsecured rewards card to target',
        tradeoff: 'Requires 7–12 months of secured card history first — not available yet',
        whenItWins: 'After 12 months of consistent on-time payments, your secured card history opens the door to this card',
        isUpgradePath: true,
      })
      break

    case 'early_builder':
      if (answers.creditSituation === 'multiple_late') {
        // Primary is Capital One QuicksilverOne
        alts.push({
          institution: 'discover',
          product: 'Discover it® Cash Back',
          headline: '5% rotating categories + Cashback Match in year 1',
          tradeoff: 'Higher approval bar — typically requires 12 months of clean payment history first',
          whenItWins: 'After 12 consecutive months of on-time payments, this is the next card to apply for',
          isUpgradePath: true,
        })
      } else {
        // Primary is Discover it Cash Back
        alts.push({
          institution: 'capital_one',
          product: 'Capital One QuicksilverOne Cash Rewards',
          headline: '1.5% flat cashback — easier approval, $39/year fee',
          tradeoff: '$39 annual fee and lower ceiling than Discover — but more lenient approval criteria',
          whenItWins: 'If Discover declines your application — Capital One\'s approval algorithm is more lenient at this stage',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'chase',
          product: 'Chase Freedom Unlimited®',
          headline: '1.5% base + 3% dining — anchor of the Chase ecosystem',
          tradeoff: 'Typically requires 670+ score with clean history — not yet accessible for most early builders',
          whenItWins: 'Once your score crosses 670 and you have 12+ months of clean payment history',
          isUpgradePath: true,
        })
      }
      break

    case 'emerging_optimizer': {
      const useChase = archetype === 'traditional_hybrid' || archetype === 'early_wealth_starter'
      const wantsSimple = answers.moneyStyle === 'simple_and_clear' || answers.moneyStyle === 'set_and_forget'
      if (useChase) {
        // Primary is Chase Freedom Unlimited (or Citi if wantsSimple)
        if (wantsSimple) {
          // Primary is Citi Double Cash — Discover as higher-ceiling alt, Sapphire as upgrade
          alts.push({
            institution: 'discover',
            product: 'Discover it® Cash Back',
            headline: '5% rotating categories — higher ceiling if you activate quarterly',
            tradeoff: 'Requires quarterly activation and category tracking — more work, higher peak earnings',
            whenItWins: 'If you decide you want to optimize spend categories rather than flat simplicity',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel — unlocks Chase Ultimate Rewards transfers',
            tradeoff: '$95/year fee — points become worth 1.25–2.25¢ each for travel vs 1¢ for cash',
            whenItWins: 'In 12–18 months once travel becomes a meaningful spend category',
            isUpgradePath: true,
          })
        } else {
          alts.push({
            institution: 'discover',
            product: 'Discover it® Cash Back',
            headline: '5% rotating categories — higher ceiling with quarterly activation',
            tradeoff: 'Requires activating bonus categories each quarter — more work but potentially more cashback',
            whenItWins: 'If you\'re willing to manage quarterly categories and want to maximize cashback over ecosystem breadth',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining, 2x travel — unlocks Chase Ultimate Rewards transfers',
            tradeoff: '$95/year fee — points become worth 1.25–2.25¢ each for travel vs 1¢ for cash',
            whenItWins: 'In 12–18 months once travel becomes a meaningful spend category and you want transferable points',
            isUpgradePath: true,
          })
        }
      } else {
        // Primary is Discover it Cash Back (or Citi if wantsSimple)
        if (wantsSimple) {
          // Primary is Citi Double Cash — Discover as higher-ceiling alt, Sapphire as upgrade
          alts.push({
            institution: 'discover',
            product: 'Discover it® Cash Back',
            headline: '5% rotating categories — higher ceiling if you activate quarterly',
            tradeoff: 'Requires quarterly category activation — more management overhead but higher peak earnings',
            whenItWins: 'If you decide to optimize categories rather than keep a single flat rate',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel, 14 transfer partners',
            tradeoff: '$95/year fee — the step up to premium rewards once the foundation is solid',
            whenItWins: 'Once your score reaches 700+ and travel becomes a primary spending category',
            isUpgradePath: true,
          })
        } else {
          alts.push({
            institution: 'citi',
            product: 'Citi Double Cash® Card',
            headline: '2% flat on everything — simpler than managing quarterly categories',
            tradeoff: 'No 5% ceiling — flat 2% vs Discover\'s 5% quarters means lower peak earning on bonus categories',
            whenItWins: 'If you prefer one flat rate over quarterly activation and category tracking',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel, 14 transfer partners',
            tradeoff: '$95/year fee — the step up to premium rewards once the foundation is solid',
            whenItWins: 'Once your score reaches 700+ and travel becomes a primary spending category',
            isUpgradePath: true,
          })
        }
      }
      break
    }

    case 'rewards_optimizer': {
      if (carriesBalance) {
        // Primary is Discover it Cash Back (balance warning)
        alts.push({
          institution: 'capital_one',
          product: 'Capital One Quicksilver Cash Rewards',
          headline: '1.5% flat cashback — simpler, no categories to manage',
          tradeoff: 'Lower earning potential than Discover\'s 5% quarters — but zero activation overhead',
          whenItWins: 'While you focus on clearing the balance — a simpler card removes category management pressure',
          isUpgradePath: false,
        })
        alts.push({
          institution: 'chase',
          product: 'Chase Sapphire Preferred®',
          headline: 'The premium card your score qualifies for — after the balance is cleared',
          tradeoff: '$95/year fee, 20%+ APR — carrying a balance here costs far more than any rewards earned',
          whenItWins: 'After 3 consecutive zero-balance statements — this is the real target once you\'re paying in full',
          isUpgradePath: true,
        })
      } else if (paysInFull && (archetype === 'rewards_builder' || archetype === 'early_wealth_starter')) {
        const useAmex = highIncome
        if (useAmex) {
          // Primary is Amex Gold
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel — 14 airline and hotel transfer partners',
            tradeoff: '4x dining vs Amex Gold\'s 4x — comparable category rates, but Chase has broader transfer partners',
            whenItWins: 'If you prioritize airline/hotel transfers over Amex Membership Rewards — Chase partners include United, Hyatt, and Southwest',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Reserve®',
            headline: '$300 travel credit, 3x travel/dining, Priority Pass lounge access',
            tradeoff: '$550/year fee — the $300 travel credit offsets ~$300, net cost is ~$250 for heavy travelers',
            whenItWins: 'Once travel spending exceeds $6,000/year and you use the $300 travel credit + lounge access fully',
            isUpgradePath: true,
          })
        } else {
          // Primary is Chase Sapphire Preferred
          alts.push({
            institution: 'amex',
            product: 'American Express® Gold Card',
            headline: '4x at restaurants and U.S. supermarkets — higher category multipliers',
            tradeoff: '$250/year fee vs Sapphire\'s $95 — justified by $240 in annual credits for high food spenders',
            whenItWins: 'If dining + grocery spending exceeds $1,000/month — 4x vs 3x earns meaningfully more at that volume',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Reserve®',
            headline: '$300 travel credit, 3x travel/dining, superior lounge access',
            tradeoff: '$550/year fee — net cost is ~$250 after the $300 travel credit',
            whenItWins: 'Once travel spending exceeds $6,000/year and the $300 credit + Priority Pass is fully utilized',
            isUpgradePath: true,
          })
        }
      } else if (archetype === 'traditional_hybrid') {
        const wantsSimple = answers.moneyStyle === 'simple_and_clear' || answers.moneyStyle === 'set_and_forget'
        const primaryIsCiti = wantsSimple
        if (primaryIsCiti) {
          // Primary is Citi Double Cash — Chase Freedom Flex as active-management upgrade
          alts.push({
            institution: 'chase',
            product: 'Chase Freedom Flex®',
            headline: '5% rotating categories — higher ceiling if you activate quarterly',
            tradeoff: 'Requires quarterly category activation — more management but higher peak earnings than flat 2%',
            whenItWins: 'If you decide to optimize categories rather than keep flat simplicity',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel — unlocks full Ultimate Rewards value',
            tradeoff: '$95/year fee — converts Freedom Flex points from 1¢ to 1.25–2.25¢ each for travel',
            whenItWins: 'Once you want to use Chase points for travel — the Sapphire unlocks the full value of every Freedom point earned',
            isUpgradePath: true,
          })
        } else {
          // Primary is Chase Freedom Flex
          alts.push({
            institution: 'chase',
            product: 'Chase Freedom Unlimited®',
            headline: '1.5% base + 3% dining — consistent, no activation required',
            tradeoff: 'Lower peak rewards than Freedom Flex\'s 5% quarters — but earns reliably without any management',
            whenItWins: 'If you prefer consistent rewards over maximizing quarterly category bonuses',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel — unlocks full Ultimate Rewards value',
            tradeoff: '$95/year fee — converts Freedom Flex points from 1¢ to 1.25–2.25¢ each for travel',
            whenItWins: 'Once you want to use your Chase points for travel — the Sapphire is the unlock that multiplies every Freedom point earned',
            isUpgradePath: true,
          })
        }
      } else {
        const wantsSimple = answers.moneyStyle === 'simple_and_clear' || answers.moneyStyle === 'set_and_forget'
        const primaryIsCiti = wantsSimple
        if (primaryIsCiti) {
          // Primary is Citi Double Cash — Chase Freedom Unlimited as upgrade alt
          alts.push({
            institution: 'chase',
            product: 'Chase Freedom Unlimited®',
            headline: '1.5% base + 3% dining — builds toward Ultimate Rewards',
            tradeoff: 'Slightly lower flat rate than Citi (1.5% vs 2%) but earns transferable Chase points',
            whenItWins: 'Once you plan to add a Sapphire card — Freedom Unlimited points become worth 2.25¢+ for travel',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel — unlocks the full Ultimate Rewards ecosystem',
            tradeoff: '$95/year — transforms Freedom Unlimited points from 1¢ to 2.25¢ each for travel redemptions',
            whenItWins: 'Once travel becomes a significant spend category — this card makes every Freedom point worth significantly more',
            isUpgradePath: true,
          })
        } else {
          // Fallback: Chase Freedom Unlimited primary
          alts.push({
            institution: 'citi',
            product: 'Citi Double Cash® Card',
            headline: '2% flat on everything — 1% when you buy, 1% when you pay',
            tradeoff: 'No 5% categories or travel transfer partners — flat 2% on every purchase, every time',
            whenItWins: 'If you want zero category management — one card, one rate, no thinking required',
            isUpgradePath: false,
          })
          alts.push({
            institution: 'chase',
            product: 'Chase Sapphire Preferred®',
            headline: '3x dining + 2x travel — unlocks the full Ultimate Rewards ecosystem',
            tradeoff: '$95/year — transforms Freedom Unlimited points from 1¢ to 2.25¢ each for travel redemptions',
            whenItWins: 'Once travel becomes a significant spend category — this card makes every Freedom Unlimited point worth significantly more',
            isUpgradePath: true,
          })
        }
      }
      break
    }
  }

  return alts.slice(0, 2)
}

// ─── Now vs Later planning layer ──────────────────────────────────────────────

function generatePlanningLayer(
  archetype: ArchetypeId,
  creditStage: CreditStageId,
  investingReadiness: InvestingReadinessId,
  answers: UserAnswers
): PlanningLayer {
  const now: PlanningItem[] = []
  const later: PlanningItem[] = []

  // ── NOW: debt is the highest blocker ────────────────────────────────────────
  if (answers.debtSituation === 'carries_balance') {
    now.push({ label: 'Clear revolving credit card debt', category: 'credit' })
  }

  // ── NOW: emergency fund ──────────────────────────────────────────────────────
  if (answers.emergencyFund === 'none') {
    now.push({ label: 'Open a high-yield savings account', category: 'savings' })
  } else if (answers.emergencyFund === 'under_1mo') {
    now.push({ label: 'Build toward 3 months of expenses saved', category: 'savings' })
  } else if (answers.emergencyFund === 'one_3mo') {
    now.push({ label: 'Complete your 3-month emergency fund', category: 'savings' })
  }

  // ── NOW: credit foundation ───────────────────────────────────────────────────
  if (creditStage === 'no_credit') {
    now.push({ label: 'Establish your first credit account', category: 'credit' })
  } else if (answers.creditSituation === 'multiple_late') {
    now.push({ label: '12 consecutive months of on-time payments', category: 'credit' })
  }

  // ── NOW: retirement check ────────────────────────────────────────────────────
  if (answers.retirement === 'dont_know') {
    now.push({ label: 'Check your HR portal for an uncaptured 401k match', category: 'retirement' })
  } else if (answers.retirement === 'want_to_start') {
    now.push({ label: 'Open a Roth IRA — Fidelity, no minimum required', category: 'retirement' })
  } else if (answers.retirement === '401k_with_match') {
    now.push({ label: 'Confirm you\'re capturing the full employer match', category: 'retirement' })
  }

  // ── NOW: archetype-specific banking or discipline ───────────────────────────
  if (archetype === 'digital_optimizer' || archetype === 'early_wealth_starter') {
    now.push({ label: 'Enable direct deposit to unlock the full 4.60% savings rate', category: 'banking' })
  } else if (archetype === 'rewards_builder') {
    now.push({ label: 'Full-balance autopay on every card', category: 'credit' })
  }

  // ── LATER: credit upgrade path ───────────────────────────────────────────────
  if (creditStage === 'no_credit') {
    later.push({ label: 'Upgrade to a rewards card after 12 months of history', category: 'credit' })
  } else if (creditStage === 'early_builder') {
    later.push({ label: 'Apply for a no-fee rewards card once score crosses 670', category: 'credit' })
  } else if (creditStage === 'emerging_optimizer') {
    later.push({ label: 'Add a premium travel or cash back card', category: 'credit' })
  }

  // ── LATER: investing path ────────────────────────────────────────────────────
  if (investingReadiness === 'not_ready') {
    later.push({ label: 'Open a Roth IRA once emergency fund is fully funded', category: 'investing' })
  } else if (investingReadiness === 'conservative') {
    later.push({ label: 'Increase Roth IRA contribution rate as income grows', category: 'retirement' })
  } else if (investingReadiness === 'moderate') {
    later.push({ label: 'Max Roth IRA contributions ($7,000/year)', category: 'retirement' })
    later.push({ label: 'Open a taxable brokerage once tax-advantaged space is maxed', category: 'investing' })
  } else if (investingReadiness === 'growth') {
    later.push({ label: 'Open a taxable brokerage for investing beyond Roth IRA limits', category: 'investing' })
  }

  // ── LATER: archetype-specific upgrades ──────────────────────────────────────
  if (
    archetype === 'traditional_hybrid' &&
    (creditStage === 'emerging_optimizer' || creditStage === 'rewards_optimizer')
  ) {
    later.push({ label: 'Build toward the Chase Sapphire ecosystem', category: 'credit' })
  }
  if (archetype === 'rewards_builder' && creditStage === 'rewards_optimizer') {
    later.push({ label: 'Add Chase Freedom Flex for 5% rotating categories', category: 'credit' })
  }

  return {
    nowPriorities: now.slice(0, 4),
    laterOpportunities: later.slice(0, 3),
  }
}

// ─── Contextual support content ───────────────────────────────────────────────

function generateSupportContent(
  archetype: ArchetypeId,
  creditStage: CreditStageId,
  investingReadiness: InvestingReadinessId,
  answers: UserAnswers
): SupportContent {
  // ── Checking ────────────────────────────────────────────────────────────────
  const checkingFitNow: Record<ArchetypeId, string> = {
    foundation_builder:
      'Fee-free checking removes a fixed monthly drag — every dollar not lost to bank fees is available for savings and credit instead.',
    digital_optimizer:
      'SoFi earns 0.50% APY on the balance sitting between paychecks. Most checking accounts pay $0 on that float.',
    traditional_hybrid:
      'Chase is the only major bank that delivers full branch access and a top-rated mobile app — you don\'t have to choose between them.',
    rewards_builder:
      'Discover Cashback Debit earns 1% on everyday purchases that can\'t go on your credit card — debit spending should earn too.',
    early_wealth_starter:
      'SoFi\'s integrated account means idle cash earns 0.50% APY on checking and 4.60% on savings — not $0 like most banks pay on either.',
  }

  const checking: SupportBlock = {
    categoryMatter:
      'Your checking account is where every dollar lands first. Monthly fees and zero interest silently drain money you never notice losing.',
    fitNow: checkingFitNow[archetype],
    watchOut:
      'Keeping a default bank account without reviewing its fee structure. Most traditional banks charge $12–$15/month — up to $180/year for nothing.',
  }

  // ── Savings ─────────────────────────────────────────────────────────────────
  let savingsFitNow: string
  if (answers.emergencyFund === 'none') {
    savingsFitNow =
      'Opening the account is step one. Even $1 establishes the account and the rate — consistent weekly contributions compound faster than any single lump sum.'
  } else if (answers.emergencyFund === 'under_1mo') {
    savingsFitNow =
      'You have a start. Increasing the auto-transfer amount — even by $25/week — matters more than the starting balance at this stage.'
  } else if (answers.emergencyFund === 'one_3mo') {
    savingsFitNow =
      'You\'re close. Define your target: monthly expenses × 3. Once you hit it, every dollar above that threshold should flow to investing, not more savings.'
  } else {
    savingsFitNow =
      'Emergency fund is funded. The question now is whether your balance above the fund target is earning 4%+ APY or sitting idle at 0.01%.'
  }

  const savings: SupportBlock = {
    categoryMatter:
      'High-yield savings vs. a traditional account is the difference between 4%+ and 0.01% APY — that\'s $400/year on a $10,000 balance.',
    fitNow: savingsFitNow,
    watchOut:
      'Keeping savings in a checking account or a bank paying 0.01% APY. On $5,000, that\'s $200/year in forgone yield compounding silently against you.',
  }

  // ── Credit ──────────────────────────────────────────────────────────────────
  let creditFitNow: string
  let creditWatchOut: string

  if (creditStage === 'no_credit') {
    creditFitNow =
      'A secured card used correctly — one purchase monthly, paid in full — builds 12 months of positive payment history faster than any other method.'
    creditWatchOut =
      'Applying for multiple cards at once. Each hard inquiry harms a thin credit file. One secured card, used correctly, is the right first step.'
  } else if (creditStage === 'early_builder') {
    creditFitNow =
      'Payment history is 35% of your score. One missed payment on a thin file can drop your score 50–80 points and takes 12 months to recover.'
    creditWatchOut =
      'Missing a payment — even by a day — on a thin file. Set every card to autopay the minimum as a permanent backstop, then pay the full balance manually.'
  } else if (creditStage === 'emerging_optimizer') {
    creditFitNow =
      'Utilization below 10% matters more than credit limit. The balance reported is your statement balance — not what you actually owe at month-end.'
    creditWatchOut =
      'Carrying any balance on a rewards card. A 24% APR instantly erases every dollar of rewards earned — the math only works when paying in full every month.'
  } else {
    creditFitNow =
      'At this stage, optimization is about matching the right rewards structure to your actual spending patterns — not chasing the most heavily marketed card.'
    creditWatchOut =
      'Carrying a balance on a premium rewards card. Rewards card APRs run 24–29% — one month of carrying a balance wipes out months of earned rewards.'
  }

  const credit: SupportBlock = {
    categoryMatter:
      'Your credit score determines the interest rate on every loan and mortgage you\'ll ever take out. A 760 vs. 680 score can mean $50,000+ in extra interest over a 30-year mortgage.',
    fitNow: creditFitNow,
    watchOut: creditWatchOut,
  }

  // ── Investing ────────────────────────────────────────────────────────────────
  let investingFitNow: string
  if (investingReadiness === 'not_ready') {
    investingFitNow =
      'Not ready to invest yet means building the preconditions first: emergency fund funded, high-interest debt cleared. The Roth IRA becomes step two once those are done.'
  } else if (investingReadiness === 'conservative') {
    investingFitNow =
      'A target-date fund removes all allocation decisions — it automatically shifts from stocks to bonds as your retirement year approaches. No ongoing management required.'
  } else if (investingReadiness === 'moderate') {
    investingFitNow =
      'A total market index fund (FZROX, VTI) gives you the entire U.S. stock market in one holding at near-zero cost. Diversification handled automatically.'
  } else {
    investingFitNow =
      'Maximum equity exposure accepts higher short-term volatility in exchange for higher long-term expected returns. A multi-decade time horizon justifies it.'
  }

  const investing: SupportBlock = {
    categoryMatter:
      '$1,000 invested at 25 becomes ~$7,600 by 65 at 7% average returns. The same $1,000 at 35 becomes ~$3,800. Starting date matters more than contribution size.',
    fitNow: investingFitNow,
    watchOut:
      'Waiting until the market looks right or you understand it better. Time in the market consistently outperforms timing the market — the delay itself is the biggest cost.',
  }

  // ── Retirement ───────────────────────────────────────────────────────────────
  let retirementFitNow: string
  if (answers.retirement === '401k_with_match') {
    retirementFitNow =
      'Employer match is a guaranteed 50–100% return on contribution before any market return. Uncaptured match is the most expensive financial mistake available at your income level.'
  } else if (answers.retirement === '401k_no_match') {
    retirementFitNow =
      'Without a match, a Roth IRA becomes your primary tax-advantaged vehicle — 40 years of tax-free compounding consistently beats a taxable brokerage on equal contributions.'
  } else if (answers.retirement === 'want_to_start') {
    retirementFitNow =
      'Fidelity\'s Roth IRA has no minimum and no fees. A target-date fund handles all allocation automatically — open it, fund it, and leave it alone.'
  } else if (answers.retirement === 'dont_know') {
    retirementFitNow =
      'Checking your HR portal takes 10 minutes and could reveal an uncaptured employer match — a guaranteed 50–100% return you may be leaving on the table every paycheck.'
  } else {
    // not_priority
    retirementFitNow =
      'Every year without a Roth IRA contribution is a year of tax-free compounding you can\'t recover. The account takes 10 minutes to open at Fidelity with no minimum deposit required.'
  }

  const retirement: SupportBlock = {
    categoryMatter:
      'Roth IRA contributions at 25 compound tax-free for 40 years. After-tax dollars in, tax-free growth out — no other account combines those two advantages for that long.',
    fitNow: retirementFitNow,
    watchOut:
      'Treating retirement contributions as optional until income improves. Starting decade matters far more than contribution rate — every decade of delay roughly halves the final compounded value.',
  }

  return { checking, savings, credit, investing, retirement }
}

// ─── Institution comparison builders ──────────────────────────────────────────
//
// Each builder returns 2–3 rows: the recommended institution (always first)
// followed by the most relevant alternatives for that category and context.
// Pools are defined as plain objects so tree-shaking can eliminate unused data.

type CompRowBase = Omit<ComparisonRow, 'isRecommended'>

const CHECKING_POOL: Partial<Record<InstitutionId, CompRowBase>> = {
  sofi: {
    institution: 'sofi',
    product: 'Checking & Savings',
    stat: '4.60% savings APY',
    fee: '$0/month',
    caveat: 'Requires direct deposit',
  },
  capital_one: {
    institution: 'capital_one',
    product: '360 Checking',
    stat: '4.25% savings APY',
    fee: '$0/month',
    caveat: null,
  },
  chase: {
    institution: 'chase',
    product: 'Total Checking',
    stat: '4,700+ branches',
    fee: '$12/month',
    caveat: 'Waived with $500/month direct deposit',
  },
  discover: {
    institution: 'discover',
    product: 'Cashback Debit',
    stat: '1% debit cash back',
    fee: '$0/month',
    caveat: 'Up to $3,000/month in purchases',
  },
  ally: {
    institution: 'ally',
    product: 'Interest Checking',
    stat: '4.20% savings APY',
    fee: '$0/month',
    caveat: null,
  },
  schwab: {
    institution: 'schwab',
    product: 'Investor Checking',
    stat: '0.45% APY + free ATMs',
    fee: '$0/month',
    caveat: 'Unlimited worldwide ATM rebates',
  },
  fidelity: {
    institution: 'fidelity',
    product: 'Cash Management Account',
    stat: '~2.7% on uninvested cash',
    fee: '$0/month',
    caveat: 'Yield depends on money market fund; no dedicated HYSA',
  },
  wells_fargo: {
    institution: 'wells_fargo',
    product: 'Everyday Checking',
    stat: '4,500+ branches',
    fee: '$10/month',
    caveat: 'Waived with $500/month direct deposit',
  },
  bank_of_america: {
    institution: 'bank_of_america',
    product: 'Advantage Plus',
    stat: '3,900+ branches',
    fee: '$12/month',
    caveat: 'Waived with qualifying direct deposit',
  },
}

// Two best alternatives to show alongside each selected checking institution
const CHECKING_ALTS: Partial<Record<InstitutionId, InstitutionId[]>> = {
  sofi:        ['ally', 'capital_one'],
  capital_one: ['sofi', 'chase'],
  chase:       ['capital_one', 'wells_fargo'],
  discover:    ['sofi', 'capital_one'],
  schwab:      ['fidelity', 'sofi'],
  ally:        ['sofi', 'capital_one'],
}

function buildCheckingComparisons(selected: InstitutionId): ComparisonRow[] {
  const alts = CHECKING_ALTS[selected] ?? []
  return [selected, ...alts]
    .filter((id): id is InstitutionId => id in CHECKING_POOL)
    .map(id => ({ ...CHECKING_POOL[id]!, isRecommended: id === selected }))
}

const SAVINGS_POOL: Partial<Record<InstitutionId, CompRowBase>> = {
  sofi: {
    institution: 'sofi',
    product: 'Savings (integrated)',
    stat: '4.60% APY',
    fee: '$0/month',
    caveat: 'Requires direct deposit',
  },
  capital_one: {
    institution: 'capital_one',
    product: '360 Performance Savings',
    stat: '4.25% APY',
    fee: '$0/month',
    caveat: null,
  },
  amex: {
    institution: 'amex',
    product: 'High-Yield Savings',
    stat: '4.35% APY',
    fee: '$0/month',
    caveat: null,
  },
  ally: {
    institution: 'ally',
    product: 'Online Savings',
    stat: '4.20% APY',
    fee: '$0/month',
    caveat: null,
  },
  marcus: {
    institution: 'marcus',
    product: 'High-Yield Savings',
    stat: '4.10% APY',
    fee: '$0/month',
    caveat: null,
  },
}

const SAVINGS_ALTS: Partial<Record<InstitutionId, InstitutionId[]>> = {
  ally:        ['sofi', 'capital_one'],
  sofi:        ['ally', 'capital_one'],
  capital_one: ['ally', 'amex'],
  amex:        ['ally', 'marcus'],
}

function buildSavingsComparisons(selected: InstitutionId): ComparisonRow[] {
  const alts = SAVINGS_ALTS[selected] ?? []
  return [selected, ...alts]
    .filter((id): id is InstitutionId => id in SAVINGS_POOL)
    .map(id => ({ ...SAVINGS_POOL[id]!, isRecommended: id === selected }))
}

// Credit comparisons are keyed by stage since the relevant products differ
// completely between stages. Each pool entry uses the canonical product for
// that institution at that credit level.

interface CreditCompBase {
  institution: InstitutionId
  product: string
  stat: string
  fee: string
  caveat: string | null
}

const CREDIT_STAGE_POOL: Record<CreditStageId, CreditCompBase[]> = {
  no_credit: [
    { institution: 'discover',    product: 'Discover it® Secured',     stat: '2% cashback (restaurants/gas)', fee: '$0/year',  caveat: 'Refundable $200 deposit' },
    { institution: 'capital_one', product: 'Platinum Secured',         stat: 'No rewards',                    fee: '$0/year',  caveat: 'Refundable deposit required' },
  ],
  early_builder: [
    { institution: 'discover',    product: 'Discover it® Cash Back',   stat: '5% rotating + 1% base',         fee: '$0/year',  caveat: null },
    { institution: 'capital_one', product: 'QuicksilverOne',           stat: '1.5% flat cash back',           fee: '$39/year', caveat: 'More lenient approval' },
    { institution: 'chase',       product: 'Freedom Unlimited®',       stat: '1.5% base + 3% dining',         fee: '$0/year',  caveat: 'Typically requires 670+' },
  ],
  emerging_optimizer: [
    { institution: 'chase',       product: 'Freedom Unlimited®',       stat: '1.5% base + 3% dining',         fee: '$0/year',  caveat: null },
    { institution: 'discover',    product: 'Discover it® Cash Back',   stat: '5% rotating + 1% base',         fee: '$0/year',  caveat: null },
    { institution: 'citi',        product: 'Double Cash® Card',        stat: '2% flat on everything',         fee: '$0/year',  caveat: '1% buy + 1% pay' },
    { institution: 'amex',        product: 'Blue Cash Everyday®',      stat: '3% groceries + 2% gas',         fee: '$0/year',  caveat: null },
  ],
  rewards_optimizer: [
    { institution: 'chase',       product: 'Sapphire Preferred®',      stat: '3x dining + 2x travel',         fee: '$95/year', caveat: null },
    { institution: 'amex',        product: 'Gold Card',                stat: '4x dining + groceries',         fee: '$250/year', caveat: '$240 in annual credits' },
    { institution: 'citi',        product: 'Double Cash® Card',        stat: '2% flat on everything',         fee: '$0/year',  caveat: '1% buy + 1% pay' },
    { institution: 'discover',    product: 'Discover it® Cash Back',   stat: '5% rotating + 1% base',         fee: '$0/year',  caveat: null },
  ],
}

// Product name overrides: when the actual recommendation product differs from the
// pool's canonical entry for that institution (e.g. Freedom Flex vs Sapphire Preferred),
// the recommended row is updated to reflect the real recommendation.
const CREDIT_PRODUCT_OVERRIDES: Partial<Record<string, Pick<CreditCompBase, 'product' | 'stat' | 'fee' | 'caveat'>>> = {
  'Citi Double Cash® Card':              { product: 'Double Cash® Card',     stat: '2% flat on everything',    fee: '$0/year',  caveat: '1% buy + 1% pay' },
  'Chase Freedom Flex®':                 { product: 'Freedom Flex®',         stat: '5% rotating + 3% dining',  fee: '$0/year',  caveat: 'Quarterly activation required' },
  'Chase Freedom Unlimited®':           { product: 'Freedom Unlimited®',    stat: '1.5% base + 3% dining',    fee: '$0/year',  caveat: null },
  'Chase Sapphire Preferred®':          { product: 'Sapphire Preferred®',   stat: '3x dining + 2x travel',    fee: '$95/year', caveat: null },
  'American Express® Gold Card':        { product: 'Gold Card',             stat: '4x dining + groceries',    fee: '$250/year', caveat: '$240 in annual credits' },
  'Capital One QuicksilverOne Cash Rewards': { product: 'QuicksilverOne',   stat: '1.5% flat cash back',      fee: '$39/year', caveat: null },
  'Capital One Platinum Secured Card':  { product: 'Platinum Secured',      stat: 'No rewards',               fee: '$0/year',  caveat: 'Refundable deposit' },
  'Discover it® Secured Credit Card':   { product: 'Discover it® Secured',  stat: '2% cashback (restaurants/gas)', fee: '$0/year', caveat: 'Refundable deposit' },
}

function buildCreditComparisons(
  creditStage: CreditStageId,
  selectedInstitution: InstitutionId,
  selectedProduct: string,
): ComparisonRow[] {
  const pool = CREDIT_STAGE_POOL[creditStage]
  const productOverride = CREDIT_PRODUCT_OVERRIDES[selectedProduct]

  const rows: ComparisonRow[] = pool.map(row => {
    if (row.institution !== selectedInstitution) {
      return { ...row, isRecommended: false }
    }
    // Apply product override so the row reflects the actual recommended product
    const base = productOverride ? { ...row, ...productOverride } : row
    return { ...base, isRecommended: true }
  })

  // If the selected institution isn't in the pool at all (edge case: a fallback
  // recommendation not in the canonical pool), just return pool rows unmarked.
  const hasMatch = rows.some(r => r.isRecommended)
  if (!hasMatch) return rows.map(r => ({ ...r, isRecommended: false })).slice(0, 3)

  const recommended = rows.filter(r => r.isRecommended)
  const others = rows.filter(r => !r.isRecommended)
  return [...recommended, ...others].slice(0, 3)
}

// ─── Main engine — pure function ──────────────────────────────────────────────

export function generateStack(answers: UserAnswers): StackOutput {
  const scores = calculateArchetypeScores(answers)
  const primaryArchetype = getPrimaryArchetype(scores)
  const secondaryArchetype = getSecondaryArchetype(scores, primaryArchetype)
  const creditStage = determineCreditStage(answers)
  const investingReadiness = calculateInvestingReadiness(answers)
  const investingStyle = getInvestingStyle(investingReadiness)

  const checkingPrimary = getCheckingRecommendation(primaryArchetype, answers)
  const savingsPrimary = getSavingsRecommendation(primaryArchetype, answers)
  const creditPrimary = getCreditRecommendation(creditStage, primaryArchetype, answers)
  const investingRecommendation = getInvestingRecommendation(investingReadiness, primaryArchetype, answers)
  const retirementGuidance = generateRetirementGuidance(answers)
  const nextMoves = generateNextMoves(primaryArchetype, creditStage, investingReadiness, answers)
  const explanation = generateExplanation(primaryArchetype, secondaryArchetype, answers)
  const planningLayer = generatePlanningLayer(primaryArchetype, creditStage, investingReadiness, answers)
  const support = generateSupportContent(primaryArchetype, creditStage, investingReadiness, answers)
  const comparisons = {
    checking: buildCheckingComparisons(checkingPrimary.institution),
    savings: buildSavingsComparisons(savingsPrimary.institution),
    credit: buildCreditComparisons(creditStage, creditPrimary.institution, creditPrimary.product),
  }

  return {
    primaryArchetype,
    secondaryArchetype,
    creditStage,
    investingReadiness,
    investingStyle,
    checking: {
      primary: checkingPrimary,
      alternatives: getCheckingAlternatives(primaryArchetype, secondaryArchetype, answers),
    },
    savings: {
      primary: savingsPrimary,
      alternatives: getSavingsAlternatives(primaryArchetype, secondaryArchetype, answers),
    },
    credit: {
      primary: creditPrimary,
      alternatives: getCreditAlternatives(creditStage, primaryArchetype, answers),
    },
    investingRecommendation,
    retirementGuidance,
    nextMoves,
    explanation,
    planningLayer,
    support,
    comparisons,
  }
}
