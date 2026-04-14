import type { InstitutionId } from './types'

export interface InstitutionMeta {
  id: InstitutionId
  name: string
  abbreviation: string
  color: string
  tagline: string
}

export const INSTITUTIONS: Record<InstitutionId, InstitutionMeta> = {
  sofi: {
    id: 'sofi',
    name: 'SoFi',
    abbreviation: 'SOFI',
    color: '#6C47FF',
    tagline: 'All-in-one digital finance',
  },
  capital_one: {
    id: 'capital_one',
    name: 'Capital One',
    abbreviation: 'CAP1',
    color: '#D03027',
    tagline: 'No-hassle banking',
  },
  amex: {
    id: 'amex',
    name: 'American Express',
    abbreviation: 'AMEX',
    color: '#016FD0',
    tagline: 'Premium rewards & savings',
  },
  chase: {
    id: 'chase',
    name: 'Chase',
    abbreviation: 'JPM',
    color: '#117ACA',
    tagline: 'Branch + digital ecosystem',
  },
  ally: {
    id: 'ally',
    name: 'Ally',
    abbreviation: 'ALLY',
    color: '#8D6E0A',
    tagline: 'High-yield online banking',
  },
  discover: {
    id: 'discover',
    name: 'Discover',
    abbreviation: 'DFS',
    color: '#FF6600',
    tagline: 'Cash back with no annual fee',
  },
  fidelity: {
    id: 'fidelity',
    name: 'Fidelity',
    abbreviation: 'FDLY',
    color: '#006638',
    tagline: 'Zero-cost index fund investing',
  },
}
