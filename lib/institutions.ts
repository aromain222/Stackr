import type { InstitutionId } from './types'

// ─── Institution rate facts ────────────────────────────────────────────────────

export interface InstitutionRates {
  checkingApy: string | null
  savingsApy: string | null
  savingsApyNote: string | null
  monthlyFee: string
  feeWaiver: string | null
}

export interface InstitutionMeta {
  id: InstitutionId
  name: string
  abbreviation: string
  color: string
  /** High-level category: shapes filtering and display context */
  type: 'bank' | 'neobank' | 'brokerage' | 'savings_only'
  tagline: string
  rates: InstitutionRates
  strengths: [string, string, string]
  tradeoff: string
  bestFor: string
  /** Primary URL for opening a deposit / brokerage account */
  openAccountUrl: string | null
  /** URL for credit card application — null if no card products */
  applyUrl: string | null
  /** Logo URL for display in recommendation and alternative cards */
  logoUrl: string
}

export const INSTITUTIONS: Record<InstitutionId, InstitutionMeta> = {
  sofi: {
    id: 'sofi',
    name: 'SoFi',
    abbreviation: 'SOFI',
    color: '#6C47FF',
    type: 'neobank',
    tagline: 'All-in-one digital finance',
    rates: {
      checkingApy: '0.50%',
      savingsApy: '4.60%',
      savingsApyNote: 'Rate drops to 1.20% without direct deposit',
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      'Highest integrated yield when direct deposit is active (4.60% savings + 0.50% checking)',
      'Unified checking and savings in one app — no inter-bank transfers needed',
      'Paycheck arrives up to 2 days early with direct deposit',
    ],
    tradeoff: 'The 4.60% savings rate requires direct deposit — without it, you earn 1.20%',
    bestFor: 'Digital-first users who will route their paycheck through SoFi to unlock the full rate',
    openAccountUrl: 'https://www.sofi.com/banking/',
    applyUrl: null,
    logoUrl: 'https://www.google.com/s2/favicons?domain=sofi.com&sz=128',
  },

  capital_one: {
    id: 'capital_one',
    name: 'Capital One',
    abbreviation: 'CAP1',
    color: '#D03027',
    type: 'bank',
    tagline: 'No-hassle banking',
    rates: {
      checkingApy: '0.10%',
      savingsApy: '4.25%',
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      '4.25% savings APY with zero conditions — no direct deposit, no minimum balance',
      '~500 branch and Café locations for occasional in-person needs',
      'No fees, no minimums, no requirements to maintain any rate',
    ],
    tradeoff: 'Lower checking APY (0.10%) and a smaller physical footprint than Chase',
    bestFor: 'Users who want competitive savings yield with no strings attached',
    openAccountUrl: 'https://www.capitalone.com/bank/checking-accounts/',
    applyUrl: 'https://www.capitalone.com/credit-cards/secured/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=capitalone.com&sz=128',
  },

  amex: {
    id: 'amex',
    name: 'American Express',
    abbreviation: 'AMEX',
    color: '#016FD0',
    type: 'bank',
    tagline: 'Premium rewards & savings',
    rates: {
      checkingApy: null,
      savingsApy: '4.35%',
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      '4.35% APY with zero conditions — no direct deposit, no minimum balance required',
      'Pairs with any existing checking account — no need to switch banks',
      'Strong brand trust and full FDIC insurance',
    ],
    tradeoff: 'Savings-only — no checking product; external transfers take 1–3 business days',
    bestFor: 'Adding a high-yield savings account without changing your primary checking bank',
    openAccountUrl: 'https://www.americanexpress.com/en-us/banking/online-savings/',
    applyUrl: 'https://www.americanexpress.com/us/credit-cards/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=americanexpress.com&sz=128',
  },

  chase: {
    id: 'chase',
    name: 'Chase',
    abbreviation: 'JPM',
    color: '#117ACA',
    type: 'bank',
    tagline: 'Branch + digital ecosystem',
    rates: {
      checkingApy: '0%',
      savingsApy: '0.01%',
      savingsApyNote: null,
      monthlyFee: '$12/month',
      feeWaiver: '$500+ monthly direct deposit or $1,500+ average daily balance',
    },
    strengths: [
      '4,700+ branch locations — the largest bank network in the United States',
      'Consistently top-rated mobile app with Zelle, instant transfers, and card controls',
      'Deep rewards ecosystem: Freedom cards earn Ultimate Rewards points redeemable at 2.25¢+ via Sapphire',
    ],
    tradeoff: 'Chase Savings pays just 0.01% APY — you need a separate HYSA for savings to earn real yield',
    bestFor: 'Branch access, ecosystem breadth, and the best card rewards program in traditional banking',
    openAccountUrl: 'https://www.chase.com/personal/checking',
    applyUrl: 'https://creditcards.chase.com/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=chase.com&sz=128',
  },

  ally: {
    id: 'ally',
    name: 'Ally',
    abbreviation: 'ALLY',
    color: '#8D6E0A',
    type: 'neobank',
    tagline: 'High-yield online banking',
    rates: {
      checkingApy: '0.25%',
      savingsApy: '4.20%',
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      '4.20% savings APY with no conditions — no direct deposit, no minimum balance',
      'Savings Buckets let you split one account into named goals without opening multiple accounts',
      'Interest Checking pays 0.25% APY — most checking accounts pay nothing',
    ],
    tradeoff: 'No physical branches; savings APY (4.20%) trails SoFi with direct deposit by 0.40%',
    bestFor: 'Clean online banking with competitive, no-condition rates and strong savings tooling',
    openAccountUrl: 'https://www.ally.com/bank/online-savings-account/',
    applyUrl: null,
    logoUrl: 'https://www.google.com/s2/favicons?domain=ally.com&sz=128',
  },

  discover: {
    id: 'discover',
    name: 'Discover',
    abbreviation: 'DFS',
    color: '#FF6600',
    type: 'bank',
    tagline: 'Cash back with no annual fee',
    rates: {
      checkingApy: '1% cash back on up to $3,000/month in debit purchases',
      savingsApy: null,
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      '1% debit cashback — the only major bank offering this on a free everyday checking account',
      'No fees, no minimums, no conditions on the checking account',
      'Credit card lineup spans every stage: secured cards for no credit through premium cash back',
    ],
    tradeoff: 'No competitive high-yield savings product; primarily a card company extending into banking',
    bestFor: 'Debit cashback and no-annual-fee credit cards for every credit stage',
    openAccountUrl: 'https://www.discover.com/online-banking/checking-account/',
    applyUrl: 'https://www.discover.com/credit-cards/cash-back/it-card.html',
    logoUrl: 'https://www.google.com/s2/favicons?domain=discover.com&sz=128',
  },

  fidelity: {
    id: 'fidelity',
    name: 'Fidelity',
    abbreviation: 'FDLY',
    color: '#006638',
    type: 'brokerage',
    tagline: 'Zero-cost index fund investing',
    rates: {
      checkingApy: null,
      savingsApy: null,
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      'FZROX: 0.00% expense ratio total U.S. market fund — the lowest possible cost for broad equity exposure',
      'No minimum to open a Roth IRA, no account fees, no trading commissions',
      'Best-in-class research tools and fund selection for long-term investors',
    ],
    tradeoff: 'Banking features (Fidelity CMA) are secondary — this is primarily an investment platform',
    bestFor: 'Zero-cost index fund investing and maximizing tax-advantaged retirement contributions',
    openAccountUrl: 'https://www.fidelity.com/open-account/overview',
    applyUrl: null,
    logoUrl: 'https://www.google.com/s2/favicons?domain=fidelity.com&sz=128',
  },

  schwab: {
    id: 'schwab',
    name: 'Schwab',
    abbreviation: 'SCHW',
    color: '#0066CC',
    type: 'brokerage',
    tagline: 'Investor-first checking and brokerage',
    rates: {
      checkingApy: '0.45%',
      savingsApy: null,
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      'Unlimited ATM fee rebates worldwide — the best checking account for frequent travelers',
      'Seamlessly integrated with Schwab brokerage: one login for checking and investing',
      'No foreign transaction fees, no minimum balance, no monthly fee',
    ],
    tradeoff: 'No dedicated high-yield savings account — uninvested cash earns less than a standalone HYSA',
    bestFor: 'Investors who want checking and brokerage under one roof, especially frequent travelers',
    openAccountUrl: 'https://www.schwab.com/open-an-account',
    applyUrl: null,
    logoUrl: 'https://www.google.com/s2/favicons?domain=schwab.com&sz=128',
  },

  wells_fargo: {
    id: 'wells_fargo',
    name: 'Wells Fargo',
    abbreviation: 'WFC',
    color: '#D71E28',
    type: 'bank',
    tagline: 'One of the largest U.S. branch networks',
    rates: {
      checkingApy: '0%',
      savingsApy: '0.01%',
      savingsApyNote: null,
      monthlyFee: '$10/month',
      feeWaiver: '$500+ monthly direct deposit or $500+ minimum daily balance',
    },
    strengths: [
      '4,500+ branch locations across 36 states — second-largest branch network in the U.S.',
      'Consistent mobile app with Zelle, real-time alerts, and easy bill pay',
      'Wide range of lending products for customers who also need mortgages or auto loans',
    ],
    tradeoff: 'Savings earns 0.01% APY — must use a separate HYSA; fee management requires attention',
    bestFor: 'Users who need in-person branch access in regions where Chase has limited presence',
    openAccountUrl: 'https://www.wellsfargo.com/checking/',
    applyUrl: 'https://www.wellsfargo.com/credit-cards/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=wellsfargo.com&sz=128',
  },

  bank_of_america: {
    id: 'bank_of_america',
    name: 'Bank of America',
    abbreviation: 'BAC',
    color: '#E31837',
    type: 'bank',
    tagline: 'Preferred Rewards amplifies every card',
    rates: {
      checkingApy: '0%',
      savingsApy: '0.01%',
      savingsApyNote: null,
      monthlyFee: '$12/month',
      feeWaiver: '$1,500+ average monthly balance or qualifying direct deposit',
    },
    strengths: [
      'Preferred Rewards boosts credit card earnings 25–75% for customers with $20k+ in combined deposits',
      '3,900+ branches and 15,000+ ATMs — broad national coverage',
      'Merrill Edge integration links banking and investing in one ecosystem',
    ],
    tradeoff: 'Savings earns 0.01% APY; Preferred Rewards requires significant deposit balances to unlock',
    bestFor: 'Customers with $20k+ in combined deposits who want amplified rewards through Preferred Rewards',
    openAccountUrl: 'https://www.bankofamerica.com/deposits/checking/checking-accounts/',
    applyUrl: 'https://www.bankofamerica.com/credit-cards/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=bankofamerica.com&sz=128',
  },

  marcus: {
    id: 'marcus',
    name: 'Marcus',
    abbreviation: 'GS',
    color: '#5A8A3C',
    type: 'savings_only',
    tagline: 'Goldman Sachs high-yield savings',
    rates: {
      checkingApy: null,
      savingsApy: '4.10%',
      savingsApyNote: null,
      monthlyFee: '$0',
      feeWaiver: null,
    },
    strengths: [
      '4.10% APY with zero conditions — no direct deposit, no minimum balance required',
      'Goldman Sachs institutional backing with full FDIC insurance',
      'Clean, simple interface focused entirely on growing savings — no distractions',
    ],
    tradeoff: 'Savings-only — no checking account or credit card; transfers to external accounts take 1–3 days',
    bestFor: 'Users who want a standalone HYSA from a name-brand institution with absolutely no conditions',
    openAccountUrl: 'https://www.marcus.com/us/en/savings/high-yield-savings',
    applyUrl: null,
    logoUrl: 'https://www.google.com/s2/favicons?domain=marcus.com&sz=128',
  },

  citi: {
    id: 'citi',
    name: 'Citi',
    abbreviation: 'CITI',
    color: '#003B8E',
    type: 'bank',
    tagline: 'Flat 2% cashback on everything',
    rates: {
      checkingApy: '0%',
      savingsApy: '4.35%',
      savingsApyNote: 'Citi Accelerate Savings; availability varies by region',
      monthlyFee: '$12/month',
      feeWaiver: '$1,500+ average monthly balance',
    },
    strengths: [
      'Double Cash earns 2% flat on every purchase — 1% when you buy, 1% when you pay, no categories ever',
      'Citi Accelerate Savings earns 4.35% APY with no conditions in eligible regions',
      'Strong fraud protection and 24/7 customer service',
    ],
    tradeoff: 'Checking fees require balance maintenance; branch access limited outside major metro areas',
    bestFor: 'The absolute simplest 2% flat cashback card — no categories, no activation, no quarterly management',
    openAccountUrl: 'https://www.citi.com/banking/checking',
    applyUrl: 'https://www.citi.com/credit-cards/compare/double-cash-credit-card',
    logoUrl: 'https://www.google.com/s2/favicons?domain=citi.com&sz=128',
  },
}
