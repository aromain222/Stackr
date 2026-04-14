import type { ArchetypeId } from './types'

export interface ArchetypeDefinition {
  id: ArchetypeId
  name: string
  tagline: string
  description: string
  traits: string[]
  color: string
  accentColor: string
}

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDefinition> = {
  foundation_builder: {
    id: 'foundation_builder',
    name: 'Foundation Builder',
    tagline: 'Building the base everything else rests on',
    description:
      'Your stack is built for stability. Establish credit, fund the emergency cushion, eliminate fees. Get those three right and investing, rewards, and optimization all open up — in that order.',
    traits: ['Credit-building focus', 'Fee-free products', 'Low-barrier accounts', 'Clear next steps'],
    color: '#F5A623',
    accentColor: '#2A1A00',
  },
  digital_optimizer: {
    id: 'digital_optimizer',
    name: 'Digital Optimizer',
    tagline: 'Every dollar working at maximum efficiency',
    description:
      'Your stack prioritizes yield, integration, and zero friction. App-first, no branches needed. High-yield savings, no-fee checking, one unified platform — every idle dollar earns instead of sitting at 0.01%.',
    traits: ['High-yield savings', 'App-first banking', 'Zero-fee accounts', 'Integrated ecosystem'],
    color: '#5B8BF5',
    accentColor: '#1A2A4A',
  },
  traditional_hybrid: {
    id: 'traditional_hybrid',
    name: 'Traditional Hybrid',
    tagline: 'Digital convenience with a human backup',
    description:
      'Your stack doesn\'t force a compromise. Best-in-class mobile app, branch access when it counts. Chase: 4,700+ locations and the top-rated banking app in traditional banking — paired with a high-yield savings account Chase itself can\'t match.',
    traits: ['Branch access', 'Strong mobile app', 'Broad ecosystem', 'Rewards potential'],
    color: '#00D4A0',
    accentColor: '#002A20',
  },
  rewards_builder: {
    id: 'rewards_builder',
    name: 'Rewards Builder',
    tagline: 'Turning everyday spending into real value',
    description:
      'Your stack extracts value from every transaction. Strong credit plus zero revolving debt means you can run premium cards at full return. Maximize category bonuses, never carry a balance — the math only works with that discipline in place.',
    traits: ['Category bonuses', 'Premium cards', 'No revolving debt', 'Maximize APY on cash'],
    color: '#C084FC',
    accentColor: '#1A0A2A',
  },
  early_wealth_starter: {
    id: 'early_wealth_starter',
    name: 'Early Wealth Starter',
    tagline: 'Building long-term wealth from a solid base',
    description:
      'Your stack is built for compounding. Foundation in place — now it\'s about maxing tax-advantaged accounts, earning full yield on idle cash, and deploying capital into low-cost index funds. Every year of delay is a year of compounding you can\'t recover.',
    traits: ['Investing-ready', 'Tax-advantaged accounts', 'Maximum yield on savings', 'Long-term compounding'],
    color: '#34D399',
    accentColor: '#002A1A',
  },
}
