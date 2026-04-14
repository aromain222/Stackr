import type { InstitutionId } from './types'

// ─── Institution rate facts ────────────────────────────────────────────────────
// All rates are static and representative; update when products change.

export interface InstitutionRates {
  /** Checking account APY or equivalent yield descriptor */
  checkingApy: string | null
  /** Savings APY at the best publicly available rate */
  savingsApy: string | null
  /** Condition required to earn the best savings rate, if any */
  savingsApyNote: string | null
  /** Monthly maintenance fee */
  monthlyFee: string
  /** Condition under which the fee is waived, or null if always free */
  feeWaiver: string | null
}

export interface InstitutionMeta {
  id: InstitutionId
  name: string
  abbreviation: string
  color: string
  tagline: string
  rates: InstitutionRates
  /** Three concrete reasons this institution stands out */
  strengths: [string, string, string]
  /** The single most honest downside — no marketing spin */
  tradeoff: string
  /** One-line "best for X" positioning */
  bestFor: string
}

export const INSTITUTIONS: Record<InstitutionId, InstitutionMeta> = {
  sofi: {
    id: 'sofi',
    name: 'SoFi',
    abbreviation: 'SOFI',
    color: '#6C47FF',
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
  },

  capital_one: {
    id: 'capital_one',
    name: 'Capital One',
    abbreviation: 'CAP1',
    color: '#D03027',
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
  },

  amex: {
    id: 'amex',
    name: 'American Express',
    abbreviation: 'AMEX',
    color: '#016FD0',
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
  },

  chase: {
    id: 'chase',
    name: 'Chase',
    abbreviation: 'JPM',
    color: '#117ACA',
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
      'Consistently top-rated mobile app (Chase Mobile) with Zelle, instant transfers, and card controls',
      'Deep rewards ecosystem: Freedom cards earn Ultimate Rewards points redeemable at 2.25¢+ via Sapphire',
    ],
    tradeoff: 'Chase Savings pays just 0.01% APY — you need a separate HYSA for savings to earn real yield',
    bestFor: 'Branch access, ecosystem breadth, and the best card rewards program in traditional banking',
  },

  ally: {
    id: 'ally',
    name: 'Ally',
    abbreviation: 'ALLY',
    color: '#8D6E0A',
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
  },

  discover: {
    id: 'discover',
    name: 'Discover',
    abbreviation: 'DFS',
    color: '#FF6600',
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
  },

  fidelity: {
    id: 'fidelity',
    name: 'Fidelity',
    abbreviation: 'FDLY',
    color: '#006638',
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
  },
}
