// ─── Analytics utility ────────────────────────────────────────────────────────
//
// All events are declared here as a typed discriminated union.
// Adding a new event: add a branch to TrackingEvent, then call track().
//
// To wire in a real provider, replace the send() implementation:
//
//   PostHog:          posthog.capture(event, properties)
//   Vercel Analytics: track(event, properties)  // '@vercel/analytics'
//   Segment:          window.analytics?.track(event, properties)
//   Amplitude:        amplitude.track(event, properties)

// ─── Event schema ──────────────────────────────────────────────────────────────

export type TrackingEvent =
  | {
      event: 'cta_clicked'
      properties: { variant: 'new_user' | 'returning_view' | 'returning_update' }
    }
  | {
      event: 'onboarding_step_viewed'
      properties: { step: number; step_key: string; total_steps: number }
    }
  | {
      event: 'onboarding_answer_selected'
      properties: { step: number; step_key: string; answer_id: string }
    }
  | {
      event: 'onboarding_completed'
      properties: { is_edit: boolean }
    }
  | {
      event: 'stack_generation_started'
      properties: Record<string, never>
    }
  | {
      event: 'results_viewed'
      properties: {
        primary_archetype: string
        secondary_archetype: string
        credit_stage: string
        investing_readiness: string
      }
    }
  | {
      event: 'action_plan_step_clicked'
      properties: { move_id: string; move_index: number; priority: string }
    }
  | {
      event: 'alternate_option_viewed'
      properties: { institution: string }
    }
  | {
      event: 'profile_reset'
      properties: Record<string, never>
    }

// ─── Type helpers ──────────────────────────────────────────────────────────────

type EventName = TrackingEvent['event']
type EventProperties<E extends EventName> = Extract<TrackingEvent, { event: E }>['properties']

// ─── Provider hook ─────────────────────────────────────────────────────────────

function send(event: string, properties: Record<string, unknown>): void {
  // Replace this block to wire in a provider. Example — PostHog:
  //
  //   import posthog from 'posthog-js'
  //   posthog.capture(event, properties)
  //
  // The rest of the file stays the same.

  if (process.env.NODE_ENV !== 'production') {
    console.debug(
      `%c[analytics] %c${event}`,
      'color:#5B8BF5;font-weight:bold',
      'color:#D0D5E8',
      properties
    )
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** Fire-and-forget. Never throws — analytics must not break the app. */
export function track<E extends EventName>(event: E, properties: EventProperties<E>): void {
  try {
    send(event, properties as Record<string, unknown>)
  } catch {
    // Swallow silently
  }
}
