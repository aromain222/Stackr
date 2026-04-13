import type { UserAnswers } from './types'

export interface QuestionOption {
  id: string
  label: string
  description: string
  icon: string
}

export interface Question {
  id: string
  step: number
  key: keyof UserAnswers
  title: string
  subtitle: string
  options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    step: 1,
    key: 'income',
    title: "What's your income situation?",
    subtitle: 'This shapes which products are actually accessible to you.',
    options: [
      {
        id: 'student',
        label: 'Student',
        description: 'No income or minimal income right now',
        icon: 'GraduationCap',
      },
      {
        id: 'part_time',
        label: 'Part-time or irregular',
        description: 'Variable pay, gig work, or side income',
        icon: 'Zap',
      },
      {
        id: 'full_time_low',
        label: 'Full-time under $50k',
        description: 'Steady job, still building financial footing',
        icon: 'Briefcase',
      },
      {
        id: 'full_time_mid',
        label: 'Full-time $50k–$100k',
        description: 'Solid income with room to optimize',
        icon: 'TrendingUp',
      },
      {
        id: 'full_time_high',
        label: 'Full-time $100k+',
        description: 'High earner focused on efficiency and growth',
        icon: 'Award',
      },
      {
        id: 'self_employed',
        label: 'Self-employed or freelance',
        description: 'Business owner, contractor, or consultant',
        icon: 'Building2',
      },
    ],
  },
  {
    id: 'q2',
    step: 2,
    key: 'creditSituation',
    title: "Where does your credit stand?",
    subtitle: "Be honest — this determines which cards you can realistically get.",
    options: [
      {
        id: 'no_credit',
        label: 'No credit history',
        description: "I've never had a credit card or loan",
        icon: 'CircleOff',
      },
      {
        id: 'one_two_cards',
        label: '1–2 cards, paying on time',
        description: 'Building history, always pay at least the minimum',
        icon: 'CreditCard',
      },
      {
        id: 'multiple_late',
        label: 'Multiple cards, occasionally late',
        description: 'Active cards but some missed or late payments',
        icon: 'AlertCircle',
      },
      {
        id: 'multiple_on_time',
        label: 'Multiple cards, always on time',
        description: 'Solid payment history, growing credit score',
        icon: 'CheckCircle',
      },
      {
        id: 'score_700_plus',
        label: 'Credit score 700+',
        description: 'Strong credit, eligible for premium products',
        icon: 'Star',
      },
    ],
  },
  {
    id: 'q3',
    step: 3,
    key: 'emergencyFund',
    title: 'How much do you have saved?',
    subtitle: "Emergency fund first — everything else is built on top of it.",
    options: [
      {
        id: 'none',
        label: 'Nothing saved',
        description: 'Starting from zero or close to it',
        icon: 'X',
      },
      {
        id: 'under_1mo',
        label: 'Less than 1 month of expenses',
        description: 'Some savings but not a real cushion yet',
        icon: 'Shield',
      },
      {
        id: 'one_3mo',
        label: '1–3 months of expenses',
        description: 'Decent buffer, working toward full security',
        icon: 'ShieldHalf',
      },
      {
        id: 'over_3mo',
        label: '3+ months of expenses',
        description: 'Solid emergency fund in place',
        icon: 'ShieldCheck',
      },
    ],
  },
  {
    id: 'q4',
    step: 4,
    key: 'bankingPreference',
    title: 'How do you prefer to bank?',
    subtitle: 'No right answer — your preference determines the best fit.',
    options: [
      {
        id: 'digital',
        label: 'Fully digital',
        description: 'App-first, never need a branch',
        icon: 'Smartphone',
      },
      {
        id: 'hybrid',
        label: 'Mix of both',
        description: 'Mostly digital, but want branch access when needed',
        icon: 'Monitor',
      },
      {
        id: 'in_person',
        label: 'In-person preferred',
        description: 'Value face-to-face banking and local branches',
        icon: 'Building2',
      },
      {
        id: 'rates_first',
        label: 'Just give me the best rates',
        description: 'I follow yield — format doesn\'t matter',
        icon: 'Percent',
      },
    ],
  },
  {
    id: 'q5',
    step: 5,
    key: 'priority',
    title: "What's your #1 financial focus?",
    subtitle: 'Pick the one that matters most right now.',
    options: [
      {
        id: 'build_credit',
        label: 'Build my credit',
        description: 'Establish or improve my credit score',
        icon: 'TrendingUp',
      },
      {
        id: 'save_more',
        label: 'Save more money',
        description: 'Grow my savings and emergency fund',
        icon: 'PiggyBank',
      },
      {
        id: 'start_investing',
        label: 'Start investing',
        description: 'Put money to work in the market',
        icon: 'BarChart2',
      },
      {
        id: 'manage_debt',
        label: 'Get out of debt',
        description: 'Pay down credit cards or loans',
        icon: 'RefreshCw',
      },
      {
        id: 'get_organized',
        label: 'Get organized',
        description: 'Understand and consolidate my accounts',
        icon: 'Layout',
      },
    ],
  },
  {
    id: 'q6',
    step: 6,
    key: 'debtSituation',
    title: 'Do you carry a credit card balance?',
    subtitle: "This affects which cards make sense and which ones could hurt you.",
    options: [
      {
        id: 'carries_balance',
        label: 'Yes, most months',
        description: 'I usually carry some balance to the next month',
        icon: 'AlertTriangle',
      },
      {
        id: 'occasionally',
        label: 'Occasionally',
        description: 'Sometimes carry a small balance, not always',
        icon: 'Minus',
      },
      {
        id: 'pays_in_full',
        label: 'No, always pay in full',
        description: 'Full statement balance, every month',
        icon: 'CheckCircle',
      },
      {
        id: 'no_card',
        label: "I don't have a credit card",
        description: 'No credit card currently',
        icon: 'XCircle',
      },
    ],
  },
  {
    id: 'q7',
    step: 7,
    key: 'retirement',
    title: 'What about retirement?',
    subtitle: 'Early action here is the highest-leverage financial move available.',
    options: [
      {
        id: '401k_with_match',
        label: "I have a 401k with employer match",
        description: "Contributing and capturing free match dollars",
        icon: 'Award',
      },
      {
        id: '401k_no_match',
        label: "I have a 401k, no match",
        description: 'Contributing but no employer contribution',
        icon: 'Bookmark',
      },
      {
        id: 'want_to_start',
        label: "I want to start but haven't",
        description: 'Ready to set up retirement savings',
        icon: 'Sunrise',
      },
      {
        id: 'not_priority',
        label: "Not a priority right now",
        description: "Focused on more immediate financial needs",
        icon: 'Clock',
      },
      {
        id: 'dont_know',
        label: "I'm not sure what I have",
        description: 'Unclear if I have any retirement accounts',
        icon: 'HelpCircle',
      },
    ],
  },
  {
    id: 'q8',
    step: 8,
    key: 'checkingPreference',
    title: "What matters most in a checking account?",
    subtitle: "This is where your money lives day-to-day — it should work for you.",
    options: [
      {
        id: 'no_fees',
        label: 'Zero fees',
        description: 'No monthly fees, no minimums, no surprises',
        icon: 'Ban',
      },
      {
        id: 'high_yield',
        label: 'Earn interest on my balance',
        description: 'Make money on the cash sitting in checking',
        icon: 'TrendingUp',
      },
      {
        id: 'rewards',
        label: 'Earn rewards on spending',
        description: 'Cashback or points on every debit purchase',
        icon: 'Gift',
      },
      {
        id: 'mobile_app',
        label: 'Best mobile experience',
        description: 'Top-tier app with smart features and design',
        icon: 'Smartphone',
      },
      {
        id: 'branch_access',
        label: 'Branch access nearby',
        description: 'A real bank I can walk into',
        icon: 'MapPin',
      },
    ],
  },
]
