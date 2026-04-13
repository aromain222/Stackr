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
      'Your stack is optimized for stability. Right now, the most valuable moves you can make are establishing credit, building an emergency fund, and eliminating fees. Once the foundation is solid, everything else — investing, rewards, optimization — becomes accessible.',
    traits: ['Credit-building focus', 'Fee-free products', 'Low-barrier accounts', 'Clear next steps'],
    color: '#F5A623',
    accentColor: '#2A1A00',
  },
  digital_optimizer: {
    id: 'digital_optimizer',
    name: 'Digital Optimizer',
    tagline: 'Every dollar working at maximum efficiency',
    description:
      'Your stack prioritizes yield, integration, and minimal friction. You manage money through apps, not branches, and you expect your accounts to earn while you sleep. The right setup means high-yield savings, zero-fee checking, and one unified digital ecosystem.',
    traits: ['High-yield savings', 'App-first banking', 'Zero-fee accounts', 'Integrated ecosystem'],
    color: '#5B8BF5',
    accentColor: '#1A2A4A',
  },
  traditional_hybrid: {
    id: 'traditional_hybrid',
    name: 'Traditional Hybrid',
    tagline: 'Digital convenience with a human backup',
    description:
      'Your stack blends the best of both worlds. You want a great mobile app and strong digital features, but branch access matters when it really counts. Chase gives you 4,700 branches and one of the strongest digital banking platforms in the country.',
    traits: ['Branch access', 'Strong mobile app', 'Broad ecosystem', 'Rewards potential'],
    color: '#00D4A0',
    accentColor: '#002A20',
  },
  rewards_builder: {
    id: 'rewards_builder',
    name: 'Rewards Builder',
    tagline: 'Turning everyday spending into real value',
    description:
      'Your stack extracts value from every transaction. With strong credit, zero revolving debt, and a focus on optimization, you can run premium cards for outsized returns. The key is maximizing category bonuses and never paying interest — which would erase all gains.',
    traits: ['Category bonuses', 'Premium cards', 'No revolving debt', 'Maximize APY on cash'],
    color: '#C084FC',
    accentColor: '#1A0A2A',
  },
  early_wealth_starter: {
    id: 'early_wealth_starter',
    name: 'Early Wealth Starter',
    tagline: 'Building long-term wealth from a solid base',
    description:
      'Your stack is built for compounding. The foundation is in place — now it\'s about maximizing tax-advantaged accounts, earning the highest yield on idle cash, and deploying capital into low-cost index funds. Time in market beats timing the market.',
    traits: ['Investing-ready', 'Tax-advantaged accounts', 'Maximum yield on savings', 'Long-term compounding'],
    color: '#34D399',
    accentColor: '#002A1A',
  },
}
