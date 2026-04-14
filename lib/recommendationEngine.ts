import type {
  UserAnswers,
  StackOutput,
  Recommendation,
  NextMove,
  AlternateOption,
  PlanningItem,
  PlanningLayer,
  SupportBlock,
  SupportContent,
  ArchetypeId,
  CreditStageId,
  InvestingReadinessId,
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

    case 'digital_optimizer':
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

    case 'early_wealth_starter':
      return {
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        headline: 'Your checking balance should earn — and with SoFi, it does',
        why: `With ${income} and ${EF_LABEL[answers.emergencyFund]}, optimizing every account matters. SoFi pays 0.50% APY on checking and 4.60% on savings with direct deposit — meaning the cash sitting in your account between paychecks earns real yield instead of nothing. Zero fees means zero drag on returns.`,
        whyNotAlternatives:
          'Traditional banks pay $0 on checking and charge $12–$15/month in fees. Chase is a better choice only if branch access is important to you. At your income and stage, SoFi\'s all-in-one yield optimization is the highest-value checking option.',
        focusNow:
          'Enable direct deposit to unlock the full 4.60% savings APY. Set up an auto-sweep rule to move anything above your monthly spending threshold into savings — every dollar above the buffer should be earning 4.60%.',
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

    case 'digital_optimizer':
      return {
        institution: 'sofi',
        product: 'SoFi Savings (integrated with Checking)',
        headline: '4.60% APY — the highest available when paired with direct deposit',
        why: `SoFi's checking and savings are one integrated account. With ${income} and direct deposit active, your savings earns 4.60% APY — higher than Ally, Marcus, or any traditional bank. There's no friction between spending and saving because it's one login, one app, one dashboard.`,
        whyNotAlternatives:
          'Ally earns 4.20% — meaningfully lower than SoFi\'s 4.60% with direct deposit. Marcus is a clean savings product but doesn\'t integrate with checking. Opening a second app and a second relationship for marginally lower yield makes no sense at your optimization level.',
        focusNow:
          'Enable direct deposit — this is the unlock for the 4.60% rate. Use SoFi Vaults to tag savings by purpose: Emergency Fund, Travel, Next Investment. The structure makes it easier to grow each bucket.',
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

    case 'early_wealth_starter':
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

function getAlternateOption(archetype: ArchetypeId, answers: UserAnswers): AlternateOption {
  switch (archetype) {
    case 'foundation_builder':
      return {
        institution: 'sofi',
        product: 'SoFi Checking & Savings',
        reason: 'If you\'re comfortable going fully digital and can set up direct deposit, SoFi earns 4.60% on savings with zero fees — a meaningful upgrade from Ally + Capital One, at the cost of no branch access.',
      }

    case 'digital_optimizer':
      return {
        institution: 'capital_one',
        product: 'Capital One 360 Checking + Performance Savings',
        reason: 'If you want a no-fee account with physical backup locations, Capital One 360 has ~500 branches and Café locations — earns 4.25% on savings with no minimum and no direct deposit requirement to unlock the rate. Slightly lower yield than SoFi but no strings attached.',
      }

    case 'traditional_hybrid':
      return {
        institution: 'capital_one',
        product: 'Capital One 360 Checking + Performance Savings',
        reason: 'If Chase\'s $12/month fee is a concern and you\'re okay with fewer branches, Capital One 360 is completely free and earns 4.25% on savings. Fewer locations but a strong mobile app and no-fee structure.',
      }

    case 'rewards_builder':
      return {
        institution: 'chase',
        product: 'Chase Sapphire Preferred + Freedom Flex',
        reason: 'If you prefer travel points over cash back, the Chase trifecta (Sapphire + Freedom Unlimited + Freedom Flex) builds a transferable points currency worth 1.5–4¢/point through transfer partners — potentially higher value than flat cashback.',
      }

    case 'early_wealth_starter':
      return {
        institution: 'amex',
        product: 'Amex High-Yield Savings + Platinum Card',
        reason: 'If you want to consolidate to one premium ecosystem, Amex HYSA at 4.35% APY + Amex Platinum\'s travel credits can offset the $695 fee for high spenders. Works best if you spend $6,000+/year on travel and dining.',
      }
  }
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

// ─── Main engine — pure function ──────────────────────────────────────────────

export function generateStack(answers: UserAnswers): StackOutput {
  const scores = calculateArchetypeScores(answers)
  const primaryArchetype = getPrimaryArchetype(scores)
  const secondaryArchetype = getSecondaryArchetype(scores, primaryArchetype)
  const creditStage = determineCreditStage(answers)
  const investingReadiness = calculateInvestingReadiness(answers)
  const investingStyle = getInvestingStyle(investingReadiness)

  const checkingRecommendation = getCheckingRecommendation(primaryArchetype, answers)
  const savingsRecommendation = getSavingsRecommendation(primaryArchetype, answers)
  const creditRecommendation = getCreditRecommendation(creditStage, primaryArchetype, answers)
  const investingRecommendation = getInvestingRecommendation(investingReadiness, primaryArchetype, answers)
  const retirementGuidance = generateRetirementGuidance(answers)
  const nextMoves = generateNextMoves(primaryArchetype, creditStage, investingReadiness, answers)
  const explanation = generateExplanation(primaryArchetype, secondaryArchetype, answers)
  const alternateOption = getAlternateOption(primaryArchetype, answers)
  const planningLayer = generatePlanningLayer(primaryArchetype, creditStage, investingReadiness, answers)
  const support = generateSupportContent(primaryArchetype, creditStage, investingReadiness, answers)

  return {
    primaryArchetype,
    secondaryArchetype,
    creditStage,
    investingReadiness,
    investingStyle,
    checkingRecommendation,
    savingsRecommendation,
    creditRecommendation,
    investingRecommendation,
    retirementGuidance,
    nextMoves,
    explanation,
    alternateOption,
    planningLayer,
    support,
  }
}
