// ─── Types ─────────────────────────────────────────────────────────────────────

export type EducationCategory = 'savings' | 'investing' | 'retirement' | 'credit' | 'banking'

export interface EducationTopic {
  id: string
  term: string
  category: EducationCategory
  definition: string
  whyItMatters: string
  example: string
  keywords: string[]
}

// ─── Topic Data ────────────────────────────────────────────────────────────────

export const EDUCATION_TOPICS: EducationTopic[] = [
  {
    id: 'apy',
    term: 'APY',
    category: 'savings',
    definition:
      'Annual Percentage Yield is the real rate of return on a savings account after accounting for compounding. Unlike APR, APY reflects how interest earned is reinvested throughout the year.',
    whyItMatters:
      'A difference of 1% APY on a $10,000 balance is $100/year — but over 5 years with compounding, that gap grows to over $510. When comparing savings accounts, APY is the only number that matters.',
    example:
      "SoFi savings currently offers 4.50% APY. A traditional big-bank savings account offers 0.01% APY. On $5,000, that's $225/year vs $0.50/year — a $224.50/year difference for identical money sitting in different places.",
    keywords: [
      'apy',
      'annual percentage yield',
      'interest rate',
      'savings rate',
      'yield',
      'high yield',
      'apr',
      'interest',
      'return',
    ],
  },
  {
    id: 'compounding',
    term: 'Compounding',
    category: 'investing',
    definition:
      'Compounding is the process where the returns on your money generate their own returns. Your gains are reinvested, and then those gains earn gains — creating exponential growth over time.',
    whyItMatters:
      'Compounding is why starting early matters so dramatically. A 25-year-old investing $200/month until 65 accumulates roughly 2.5x more than a 35-year-old doing the same — even though the 35-year-old invests for 10 fewer years.',
    example:
      "$1,000 invested at 8% annual return: after 10 years = $2,159. After 30 years = $10,063. After 40 years = $21,724. The same $1,000 does 21x more work given 40 years vs 0. That's compounding.",
    keywords: [
      'compounding',
      'compound interest',
      'compound growth',
      'exponential growth',
      'reinvest',
      'returns',
      'time value',
      'growth',
    ],
  },
  {
    id: 'roth_ira',
    term: 'Roth IRA',
    category: 'retirement',
    definition:
      'A Roth IRA is an individual retirement account where you contribute after-tax dollars and your money grows completely tax-free. Unlike a traditional IRA or 401k, you pay no taxes on qualified withdrawals in retirement.',
    whyItMatters:
      'For most young adults in lower tax brackets, paying taxes now (while rates are low) and getting tax-free growth for 30–40 years is the single highest-leverage retirement move available. The 2024 contribution limit is $7,000/year.',
    example:
      '$300/month in a Roth IRA from age 25 to 65 (at 8% average annual return) grows to approximately $1,000,000 — entirely tax-free. The same contributions in a taxable account lose 15–23.8% of gains to capital gains tax on each withdrawal.',
    keywords: [
      'roth',
      'roth ira',
      'ira',
      'retirement account',
      'individual retirement',
      'tax free',
      'tax-free',
      'after-tax',
      'retirement savings',
    ],
  },
  {
    id: '401k',
    term: '401(k)',
    category: 'retirement',
    definition:
      "A 401(k) is an employer-sponsored retirement plan that lets you contribute pre-tax income, reducing your taxable income today. Many employers match a percentage of your contributions — that match is free money.",
    whyItMatters:
      "An employer match is the only guaranteed 50–100% return available in personal finance. If your employer matches 50% up to 6% of salary, not contributing enough to capture the full match is equivalent to turning down a 50% raise on that portion of your income.",
    example:
      'Salary $60,000. Employer matches 50% of contributions up to 6% of salary. Contributing 6% ($3,600/year) earns a $1,800 match — a guaranteed 50% return before any market gains. Not contributing costs you $1,800/year in free compensation.',
    keywords: [
      '401k',
      '401(k)',
      'employer match',
      'employer plan',
      'pre-tax',
      'tax deferred',
      'retirement plan',
      'workplace retirement',
      'match',
    ],
  },
  {
    id: 'credit_score',
    term: 'Credit Score',
    category: 'credit',
    definition:
      "A credit score is a 300–850 number that lenders use to evaluate how likely you are to repay debt. It's calculated from payment history (35%), amounts owed (30%), length of credit history (15%), credit mix (10%), and new credit (10%).",
    whyItMatters:
      'Your credit score directly affects mortgage rates, apartment approvals, auto loan rates, and sometimes even employment. Going from 620 to 760 on a 30-year $350,000 mortgage can save over $100,000 in total interest payments.',
    example:
      '30-year $350,000 mortgage: at 620 score, rate ≈ 7.8% ($2,512/month). At 760+ score, rate ≈ 6.4% ($2,183/month). That\'s $329/month or $118,440 over the life of the loan — for the same house.',
    keywords: [
      'credit score',
      'fico',
      'credit rating',
      'credit report',
      'credit history',
      'score',
      'creditworthiness',
      'build credit',
      'credit',
    ],
  },
  {
    id: 'credit_utilization',
    term: 'Credit Utilization',
    category: 'credit',
    definition:
      "Credit utilization is the percentage of your available credit that you're currently using. It's the second-largest factor in your credit score, making up 30% of the FICO calculation.",
    whyItMatters:
      'Keeping utilization below 30% (ideally under 10%) is one of the fastest ways to improve your credit score. High utilization signals to lenders that you may be overleveraged, even if you pay in full each month.',
    example:
      "You have one card with a $5,000 limit. You spend $2,000 on it. That's 40% utilization — above the 30% threshold. Paying it down to $500 (10% utilization) before the statement closing date can raise your score 20–50 points within a billing cycle.",
    keywords: [
      'credit utilization',
      'utilization',
      'utilization rate',
      'credit limit',
      'balance',
      'available credit',
      'credit usage',
      'debt ratio',
    ],
  },
  {
    id: 'cashback_vs_rewards',
    term: 'Cashback vs. Rewards',
    category: 'banking',
    definition:
      "Cashback cards return a flat percentage of spending as cash. Rewards cards (points/miles) return spending as redeemable points with variable value depending on how they're redeemed — sometimes worth significantly more or less than the face value.",
    whyItMatters:
      'Cashback is simpler and always worth exactly its stated value. Rewards points are more valuable if you can leverage transfer partners or premium redemptions, but require more active management and carry risk of devaluation.',
    example:
      '2% cashback card: $500/month spending = $120/year. A rewards card offering 3x points on the same spending could be worth $180+ if redeemed for travel, or as little as $90 if redeemed for cash. The right choice depends on how actively you want to manage redemptions.',
    keywords: [
      'cashback',
      'cash back',
      'rewards',
      'points',
      'miles',
      'travel rewards',
      'credit card rewards',
      'redemption',
      'sign up bonus',
    ],
  },
  {
    id: 'hysa',
    term: 'HYSA',
    category: 'savings',
    definition:
      'A High-Yield Savings Account (HYSA) is an FDIC-insured savings account that pays significantly more interest than a traditional bank savings account — typically 4–5% APY vs 0.01–0.1% at big banks.',
    whyItMatters:
      'Your emergency fund and short-term savings should always be in a HYSA. The difference between 0.01% (Chase savings) and 4.5% (SoFi, Ally) on a $10,000 emergency fund is ~$449/year — money you earn passively for doing nothing.',
    example:
      '$10,000 emergency fund at Chase savings (0.01% APY): earns $1/year. Same $10,000 at SoFi savings (4.50% APY): earns $450/year. Over 3 years: $3 vs $1,390. HYSA wins purely by switching where idle money sits.',
    keywords: [
      'hysa',
      'high yield savings',
      'high-yield savings',
      'high yield',
      'savings account',
      'online savings',
      'fdic',
      'emergency fund',
      'savings',
    ],
  },
]

// ─── Utilities ─────────────────────────────────────────────────────────────────

export function getTopicById(id: string): EducationTopic | undefined {
  return EDUCATION_TOPICS.find((t) => t.id === id)
}

export function searchTopics(query: string): EducationTopic | undefined {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return undefined

  // First: exact or substring keyword match
  const keywordMatch = EDUCATION_TOPICS.find((topic) =>
    topic.keywords.some((kw) => normalized.includes(kw) || kw.includes(normalized))
  )
  if (keywordMatch) return keywordMatch

  // Second: term name fuzzy check
  return EDUCATION_TOPICS.find(
    (topic) =>
      topic.term.toLowerCase().includes(normalized) ||
      normalized.includes(topic.term.toLowerCase())
  )
}
