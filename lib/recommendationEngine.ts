import type {
  UserAnswers,
  StackOutput,
  Recommendation,
  NextMove,
  AlternateOption,
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
        headline: '4.35% APY — the highest in the Amex ecosystem',
        why: `With ${income} and Amex credit cards in your stack, consolidating savings at Amex makes the whole financial picture cleaner. At 4.35% APY, it's meaningfully above traditional banks and marginally above Ally. No fees, FDIC insured, and transferable to your Amex checking in one click. Your emergency fund should be earning real yield.`,
        whyNotAlternatives:
          'Chase Savings pays 0.01% APY — the difference on $10,000 is $434/year. Ally is at 4.20%, which is fine but slightly lower and requires a separate relationship. For someone running Amex cards, the consolidated view is the deciding factor.',
        focusNow:
          'Open Amex HYSA online. Transfer your full emergency fund there today — every month you delay in a low-yield account is real money forfeited. Transfers to/from Amex card accounts settle in 1–3 business days.',
      }

    case 'early_wealth_starter':
      return {
        institution: 'ally',
        product: 'Ally High-Yield Savings Account',
        headline: 'Your emergency fund earns 4.20% — investing dollars go to Fidelity',
        why: `With ${ef} and ${income}, your savings strategy has two parts: emergency fund in high-yield savings, investing dollars in tax-advantaged accounts. Ally at 4.20% APY handles the emergency fund cleanly. Everything above your 3–6 month target gets deployed to your Roth IRA or taxable brokerage — not left to earn savings rate.`,
        whyNotAlternatives:
          'SoFi is marginally higher at 4.60% with direct deposit, but your investing goes to Fidelity — not SoFi. Keeping savings and investing at separate platforms gives you the best of each. Ally\'s UX and savings tools are best-in-class for pure savings management.',
        focusNow:
          'Set a target savings balance: 3–6 months of monthly expenses. Park exactly that amount at Ally. Every dollar above that threshold should be moving into your Roth IRA or taxable brokerage at Fidelity — savings rate is not investing rate.',
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
      moves.push({
        id: 'habit',
        title: 'Automate a fixed amount to savings each paycheck',
        description: 'Decide on a number — $25, $50, $100 — and automate it. Consistency beats optimization at this stage.',
        priority: 'medium',
        timeframe: 'Next paycheck',
      })
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
        id: 'ally',
        title: 'Move emergency fund to Ally at 4.20% APY',
        description: 'Your emergency fund in a traditional savings account is losing real value. Move it to Ally today.',
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
      return `With ${income}, ${ef}, and a focus on ${priority}, you're at the start of building a financial base that everything else will sit on top of. The most valuable moves right now aren't about optimization — they're about eliminating fees, establishing credit history, and building consistent savings habits. The ${secondary.replace(/_/g, ' ')} element of your profile means you'll naturally graduate to more sophisticated products in 12–18 months once the foundation is solid.`

    case 'digital_optimizer':
      return `With ${income}, a preference for ${banking}, and a focus on ${priority}, your profile is built for efficiency. You don't need branches or paper statements — you need yield, integration, and zero waste. Every dollar you leave in a low-yield account or spend on bank fees is a dollar working against you. Your ${secondary.replace(/_/g, ' ')} tendencies mean you also value some structure — which is why this stack pairs high-yield automation with a focused credit card strategy.`

    case 'traditional_hybrid':
      return `You want ${banking}, which narrows the options significantly — and Chase is the clear answer. With ${income} and a focus on ${priority}, you need a bank that won't disappear when the app is down or when you need to deposit cash. Your ${secondary.replace(/_/g, ' ')} profile means you're also open to optimization — which is why we pair Chase checking (branch access, best app) with Capital One savings (4.25% APY, not Chase's 0.01%).`

    case 'rewards_builder':
      return `With ${income}, strong credit, and the discipline to pay in full, you're positioned to extract real value from your daily spending. ${ef} means you have the stability to run premium cards without financial risk — the only variable that matters. Your ${secondary.replace(/_/g, ' ')} tendencies confirm you're optimizing across multiple dimensions, not just rewards. The math only works if you never carry a balance — and this stack is designed for exactly that discipline.`

    case 'early_wealth_starter':
      return `With ${income}, ${ef}, and a focus on ${priority}, you're at the inflection point where financial decisions begin to compound exponentially. A dollar deployed into a Roth IRA today is worth 4–5x more than the same dollar at 35, due to compound growth. Your ${secondary.replace(/_/g, ' ')} profile means you also care about efficiency and yield on your cash — which is why this stack maximizes yield at every layer while pointing excess capital toward tax-advantaged investing.`
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
        institution: 'ally',
        product: 'Ally Checking + High-Yield Savings',
        reason: 'If you prefer separating your checking and savings into two distinct accounts, Ally\'s combination is clean and earns 4.20% on savings. Slightly lower yield than SoFi but a time-tested, stable platform.',
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
  }
}
