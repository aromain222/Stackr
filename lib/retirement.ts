import type { RetirementSituation, RetirementGuidance, UserAnswers } from './types'

// ─── Retirement Guidance by Situation ─────────────────────────────────────────

export function generateRetirementGuidance(answers: UserAnswers): RetirementGuidance {
  const { retirement, income, emergencyFund } = answers

  switch (retirement) {
    case '401k_with_match':
      return {
        status: 'On Track',
        action: 'Maximize your employer match, then open a Roth IRA at Fidelity',
        explanation:
          "Capturing your full employer match is the highest guaranteed return available to you — typically 50–100% on matched dollars, instantly. Once you're at the match threshold, layer in a Roth IRA at Fidelity (FZROX, zero expense ratio) for tax-free growth. You have both pre-tax (401k) and post-tax (Roth) buckets — that's textbook tax diversification for retirement.",
      }

    case '401k_no_match':
      return {
        status: 'Contributing',
        action: 'Open a Roth IRA alongside your 401k for tax diversification',
        explanation:
          "A 401k without a match still grows tax-deferred, which beats a taxable account. But since there's no free match to capture, a Roth IRA is equally or more attractive — you pay taxes now (likely at a lower rate than in retirement) and withdraw completely tax-free later. Contribute to both: 401k for pre-tax reduction now, Roth IRA for tax-free income later.",
      }

    case 'want_to_start':
      return {
        status: 'Ready to Start',
        action: 'Open a Roth IRA at Fidelity this week — $0 minimum, no fees',
        explanation:
          "A Roth IRA is the best starting point for most young adults. You pay taxes on contributions now (while your tax rate is likely low) and every dollar of growth is tax-free forever. Fidelity offers FZROX — a zero-expense-ratio total market index fund — with no account minimum. You can start with $50/month. Every year you delay is years of compounding you can't get back.",
      }

    case 'not_priority':
      if (emergencyFund === 'none' || emergencyFund === 'under_1mo') {
        return {
          status: 'Deferred',
          action: 'Build your emergency fund first — retirement comes right after',
          explanation:
            "Your call to defer retirement is rational right now given your savings position. Emergency fund before retirement is the correct order of operations. Once you cross 3 months of expenses, retirement becomes the single highest-leverage financial move available. A Roth IRA contribution at 25 is worth roughly 4x the same contribution at 35, due to compounding.",
        }
      }
      return {
        status: 'Deferred',
        action: 'Revisit retirement savings — compound time is running out',
        explanation:
          "You have a solid enough foundation to start. Even $100/month in a Roth IRA at 25 becomes ~$350,000 by 65 at average market returns. At 35, that same $100/month becomes ~$170,000. The cost of deferring isn't abstract — it's real compounding years. Open a Roth IRA at Fidelity this month and start small.",
      }

    case 'dont_know':
      return {
        status: 'Unchecked',
        action: 'Check your HR benefits portal — you may already have a 401k you\'re not using',
        explanation:
          "Many employers auto-enroll new hires in a 401k at a default contribution rate (often 3%). Check your HR portal or paycheck stub for retirement line items. If you have an employer match you're not capturing, that's free money being left on the table every pay period. If there's no 401k option, open a Roth IRA at Fidelity independently — you don't need an employer to start.",
      }

    default:
      return {
        status: 'Unchecked',
        action: 'Check your retirement account status',
        explanation: 'Understanding your retirement situation is an important part of your financial stack.',
      }
  }
}

// ─── Retirement Status Color ──────────────────────────────────────────────────

export function getRetirementStatusColor(status: RetirementGuidance['status']): string {
  const colors: Record<RetirementGuidance['status'], string> = {
    'On Track': '#00D4A0',
    'Contributing': '#5B8BF5',
    'Ready to Start': '#F5A623',
    'Deferred': '#7C8599',
    'Unchecked': '#F56060',
  }
  return colors[status] ?? '#7C8599'
}
