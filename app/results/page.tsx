'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronDown, ExternalLink, Layers, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/logo'
import { generateStack } from '@/lib/recommendationEngine'
import { ARCHETYPES } from '@/lib/archetypes'
import { INSTITUTIONS } from '@/lib/institutions'
import { CREDIT_STAGES } from '@/lib/credit'
import { INVESTING_READINESS } from '@/lib/investing'
import { getRetirementStatusColor } from '@/lib/retirement'
import { loadAnswers, saveMeta, clearProfile } from '@/lib/storage'
import { track } from '@/lib/analytics'
import type { StackOutput, Recommendation, AlternativeRecommendation, PlanningLayer, PlanningCategory, SupportBlock, ComparisonRow, InstitutionId } from '@/lib/types'
import { EducationPanelProvider, EducationTrigger } from '@/components/ui/education-panel'

// ─── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  checking: { label: 'Cash', color: '#5B8BF5', dimColor: '#1A2A4A' },
  savings: { label: 'Save', color: '#00D4A0', dimColor: '#002A20' },
  credit: { label: 'Credit', color: '#F5A623', dimColor: '#2A1A00' },
  investing: { label: 'Grow', color: '#C084FC', dimColor: '#1A0A2A' },
}

const PRIORITY_COLOR = {
  high: '#00D4A0',
  medium: '#5B8BF5',
  low: '#4A5166',
}

const PLANNING_CATEGORY_COLOR: Record<PlanningCategory, string> = {
  banking: '#5B8BF5',
  savings: '#00D4A0',
  credit: '#F5A623',
  investing: '#C084FC',
  retirement: '#C084FC',
}

const ARCHETYPE_BADGE_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'purple' | 'muted'> = {
  foundation_builder: 'warning',
  digital_optimizer: 'default',
  traditional_hybrid: 'success',
  rewards_builder: 'purple',
  early_wealth_starter: 'success',
}

// ─── Stack generation animation ────────────────────────────────────────────────

const STACK_LAYERS = [
  { key: 'checking', label: 'Cash', color: '#5B8BF5' },
  { key: 'savings', label: 'Save', color: '#00D4A0' },
  { key: 'credit', label: 'Credit', color: '#F5A623' },
  { key: 'investing', label: 'Grow', color: '#C084FC' },
]

// ─── Error screen ──────────────────────────────────────────────────────────────

function ErrorScreen() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-10 h-10 rounded-full border border-[#F56060]/30 bg-[#F56060]/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-[#F56060] font-bold text-base leading-none">!</span>
        </div>
        <h2 className="text-xl font-bold text-[#F0F2F8] mb-3">Couldn't build your stack</h2>
        <p className="text-sm text-[#7C8599] leading-relaxed mb-8">
          Your saved answers look incomplete or couldn't be read. Retaking the quiz takes about 2 minutes.
        </p>
        <Button onClick={() => router.push('/onboarding')} className="w-full justify-center">
          Retake the quiz
        </Button>
      </motion.div>
    </div>
  )
}

// ─── Stack generation animation ────────────────────────────────────────────────

function GeneratingScreen() {
  const [resolvedCount, setResolvedCount] = useState(0)

  useEffect(() => {
    const timers = STACK_LAYERS.map((_, i) =>
      setTimeout(() => setResolvedCount(i + 1), 400 + i * 450)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Layers className="w-6 h-6 text-[#5B8BF5] mx-auto mb-4" />
          <p className="text-sm text-[#7C8599] uppercase tracking-widest font-medium">
            Analyzing your profile
          </p>
        </div>

        <div className="space-y-3">
          {STACK_LAYERS.map((layer, i) => {
            const resolved = resolvedCount > i
            return (
              <motion.div
                key={layer.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-4 rounded-xl border border-[#1C2030] bg-[#0E1018] px-5 py-4"
              >
                <div
                  className="w-0.5 h-7 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-widest w-14 flex-shrink-0"
                  style={{ color: layer.color }}
                >
                  {layer.label}
                </span>
                <div className="flex-1">
                  {resolved ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4A0] flex-shrink-0" />
                      <span className="text-sm text-[#7C8599]">Matched</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-1 w-16 rounded-full"
                        style={{ backgroundColor: layer.color, opacity: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Institution logo with fallback ───────────────────────────────────────────

function InstitutionLogo({ id, size = 24 }: { id: InstitutionId; size?: number }) {
  const inst = INSTITUTIONS[id]
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className="flex-shrink-0 rounded-sm flex items-center justify-center font-bold text-white"
        style={{
          width: size,
          height: size,
          backgroundColor: inst.color,
          fontSize: Math.round(size * 0.5),
        }}
      >
        {inst.name[0]}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <span
      className="flex-shrink-0 rounded-sm overflow-hidden bg-white flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <img
        src={inst.logoUrl}
        alt={inst.name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="w-full h-full object-contain"
      />
    </span>
  )
}

// ─── Stack map row (expandable) ────────────────────────────────────────────────

function StackMapRow({
  category,
  rec,
  support,
  comparisons,
  alternatives,
  index,
  educationTopicId,
}: {
  category: keyof typeof CATEGORY_META
  rec: Recommendation
  support: SupportBlock
  comparisons: ComparisonRow[]
  alternatives: AlternativeRecommendation[]
  index: number
  educationTopicId?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[category]
  const inst = INSTITUTIONS[rec.institution]

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl border bg-[#0E1018] overflow-hidden transition-colors duration-200 ${expanded ? 'border-[#2D3247]' : 'border-[#1C2030]'}`}
    >
      {/* Row header — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#141720] transition-colors duration-200"
      >
        <div
          className="w-0.5 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: meta.color }}
        />
        <span
          className="text-xs font-semibold uppercase tracking-widest w-14 flex-shrink-0"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-[#F0F2F8] truncate">{rec.product}</p>
          <p className="text-xs text-[#7C8599] mt-0.5">{rec.headline}</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium pl-1 pr-2.5 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: meta.dimColor, color: meta.color }}
        >
          <InstitutionLogo id={rec.institution} size={22} />
          <span className="hidden sm:inline">{inst.name}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#4A5166] flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-[#1C2030]">
              <div className="space-y-4 pt-5">
                <div className="rounded-xl bg-[#141720] border border-[#1C2030] p-4">
                  <p className="card-label text-[#5B8BF5] mb-2">Why this one</p>
                  <p className="text-sm text-[#D0D5E8] leading-relaxed">{rec.why}</p>
                </div>

                {comparisons.length > 0 && <ComparisonTable rows={comparisons} />}

                <div className="rounded-xl bg-[#141720] border border-[#1C2030] p-4">
                  <p className="card-label text-[#7C8599] mb-2">Why not the others</p>
                  <p className="text-sm text-[#7C8599] leading-relaxed">{rec.whyNotAlternatives}</p>
                </div>

                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: `${meta.color}0D`, borderColor: `${meta.color}30` }}
                >
                  <p className="card-label mb-2" style={{ color: meta.color }}>Focus now</p>
                  <p className="text-sm text-[#D0D5E8] leading-relaxed">{rec.focusNow}</p>
                </div>
              </div>

              {/* Action button */}
              {(category === 'credit' ? inst.applyUrl : inst.openAccountUrl) && (
                <div className="mt-5">
                  <a
                    href={(category === 'credit' ? inst.applyUrl : inst.openAccountUrl)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150"
                    style={{
                      backgroundColor: `${meta.color}12`,
                      border: `1px solid ${meta.color}30`,
                      color: meta.color,
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    {category === 'credit' ? 'Apply Now' : 'Open Account'}
                  </a>
                  <p className="text-xs text-[#4A5166] mt-2">
                    You&apos;ll be redirected to the provider&apos;s official site
                  </p>
                </div>
              )}

              {/* Support layer */}
              <div className="mt-5 pt-5 border-t border-[#1C2030] space-y-2.5">
                <p className="text-xs text-[#4A5166] leading-relaxed">
                  <span className="font-medium">Why this category — </span>
                  {support.categoryMatter}
                </p>
                <p className="text-xs text-[#4A5166] leading-relaxed">
                  <span className="font-medium">Why this fits now — </span>
                  {support.fitNow}
                </p>
                <p className="text-xs text-[#4A5166] leading-relaxed">
                  <span className="font-medium">Watch out for — </span>
                  {support.watchOut}
                </p>
              </div>

              {/* Education trigger */}
              {educationTopicId && (
                <div className="mt-4 pt-4 border-t border-[#1C2030]">
                  <EducationTrigger
                    topicId={educationTopicId}
                    label={
                      category === 'savings'
                        ? 'What is APY?'
                        : category === 'credit'
                        ? 'What builds credit?'
                        : category === 'investing'
                        ? 'What is compounding?'
                        : 'Learn more'
                    }
                  />
                </div>
              )}

              {/* Alternatives */}
              {alternatives.length > 0 && (
                <div className="mt-5 pt-5 border-t border-[#1C2030]">
                  <p className="card-label text-[#4A5166] mb-3">Alternatives</p>
                  <div className="space-y-2">
                    {alternatives.map((alt, idx) => (
                      <AlternativeCard
                        key={`${alt.institution}-${alt.product}`}
                        alt={alt}
                        color={meta.color}
                        category={category}
                        isFirst={idx === 0}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Institution comparison table ─────────────────────────────────────────────

function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  if (!rows.length) return null
  return (
    <div>
      <p className="card-label text-[#4A5166] mb-2.5">vs the field</p>
      <div className="rounded-xl border border-[#1C2030] divide-y divide-[#1C2030] overflow-hidden">
        {rows.map((row, i) => {
          const inst = INSTITUTIONS[row.institution]
          return (
            <div key={`${row.institution}-${i}`}>
              <div
                className={[
                  'flex items-center gap-3 px-4 py-2.5',
                  row.isRecommended ? 'bg-[#141720]' : '',
                ].join(' ')}
              >
                {/* Colored dot — institution color if recommended, dim if not */}
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: row.isRecommended ? inst.color : '#2D3247' }}
                />
                {/* Institution name */}
                <span
                  className="text-xs font-medium w-[5.5rem] flex-shrink-0"
                  style={{ color: row.isRecommended ? inst.color : '#7C8599' }}
                >
                  {inst.name}
                </span>
                {/* Product name — hidden on small screens to avoid overflow */}
                <span className="text-xs text-[#4A5166] flex-1 min-w-0 truncate hidden sm:block">
                  {row.product}
                </span>
                {/* Primary stat */}
                <span
                  className={[
                    'text-xs font-medium flex-shrink-0 ml-auto sm:ml-0',
                    row.isRecommended ? 'text-[#F0F2F8]' : 'text-[#7C8599]',
                  ].join(' ')}
                >
                  {row.stat}
                </span>
                {/* Fee */}
                <span className="text-xs text-[#4A5166] flex-shrink-0 w-16 text-right">
                  {row.fee}
                </span>
              </div>
              {/* Caveat shown as an indented note beneath the row */}
              {row.caveat && (
                <p className="px-4 pb-2 text-xs text-[#4A5166] leading-relaxed pl-9">
                  {row.caveat}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Alternative recommendation card ──────────────────────────────────────────

function AlternativeCard({
  alt,
  color,
  category,
  isFirst,
}: {
  alt: AlternativeRecommendation
  color: string
  category: keyof typeof CATEGORY_META
  isFirst: boolean
}) {
  const inst = INSTITUTIONS[alt.institution]
  const actionUrl = category === 'credit' ? inst.applyUrl : inst.openAccountUrl
  const actionLabel = category === 'credit' ? 'Apply Now' : 'Open Account'

  return (
    <div className="rounded-xl border border-[#1C2030] bg-[#0E1018] p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <InstitutionLogo id={alt.institution} size={24} />
            <span className="text-xs font-medium text-[#7C8599]">{inst.name}</span>
            <span className="text-xs text-[#2D3247]">·</span>
            <span className="text-xs text-[#4A5166] truncate">{alt.product}</span>
          </div>
          <p className="text-sm font-medium text-[#D0D5E8] leading-snug">{alt.headline}</p>
        </div>
        {alt.isUpgradePath && (
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}15`, color }}
          >
            Later
          </span>
        )}
      </div>
      <div className="space-y-1 mt-3">
        <p className="text-xs text-[#4A5166] leading-relaxed">
          <span className="font-medium text-[#7C8599]">Tradeoff — </span>
          {alt.tradeoff}
        </p>
        <p className="text-xs text-[#4A5166] leading-relaxed">
          <span className="font-medium text-[#7C8599]">Best when — </span>
          {alt.whenItWins}
        </p>
      </div>
      {isFirst && actionUrl && (
        <div className="mt-3 pt-3 border-t border-[#1C2030] flex items-center gap-3">
          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#4A5166] hover:text-[#7C8599] transition-colors duration-150"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            {actionLabel}
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Now vs Later section ──────────────────────────────────────────────────────

function NowLaterSection({ planning }: { planning: PlanningLayer }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="section-label mb-4">
        Now vs Later
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Now card */}
        <div className="rounded-2xl border border-[#1C2030] bg-[#0E1018] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#F0F2F8] mb-4">
            Right now
          </p>
          <ul className="space-y-3">
            {planning.nowPriorities.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0"
                  style={{ backgroundColor: PLANNING_CATEGORY_COLOR[item.category] }}
                />
                <span className="text-sm text-[#D0D5E8] leading-snug">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Later card */}
        <div className="rounded-2xl border border-[#1C2030] bg-[#0E1018] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4A5166] mb-4">
            Once you level up
          </p>
          <ul className="space-y-3">
            {planning.laterOpportunities.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0 opacity-50"
                  style={{ backgroundColor: PLANNING_CATEGORY_COLOR[item.category] }}
                />
                <span className="text-sm text-[#7C8599] leading-snug">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  )
}

// ─── Main results page ─────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const [stack, setStack] = useState<StackOutput | null>(null)
  const [generating, setGenerating] = useState(true)
  const [error, setError] = useState(false)
  const hasTrackedResults = useRef(false)

  useEffect(() => {
    const answers = loadAnswers()
    if (!answers) {
      router.push('/onboarding')
      return
    }

    track('stack_generation_started', {})

    let result: StackOutput
    try {
      result = generateStack(answers)
    } catch {
      setError(true)
      setGenerating(false)
      return
    }

    setStack(result)

    // Persist lightweight meta for the landing page return-user experience
    saveMeta({
      savedAt: new Date().toISOString(),
      archetypeName: ARCHETYPES[result.primaryArchetype].name,
      creditStageName: CREDIT_STAGES[result.creditStage].name,
    })

    // Show generation animation for at least 2.2s
    const timer = setTimeout(() => setGenerating(false), 2200)
    return () => clearTimeout(timer)
  }, [router])

  // Track results_viewed once the animation resolves and the page is visible
  useEffect(() => {
    if (generating || !stack || hasTrackedResults.current) return
    hasTrackedResults.current = true
    track('results_viewed', {
      primary_archetype: stack.primaryArchetype,
      secondary_archetype: stack.secondaryArchetype,
      credit_stage: stack.creditStage,
      investing_readiness: stack.investingReadiness,
    })
  }, [generating, stack])

  if (error) {
    return <ErrorScreen />
  }

  if (generating || !stack) {
    return <GeneratingScreen />
  }

  const archetype = ARCHETYPES[stack.primaryArchetype]
  const creditStage = CREDIT_STAGES[stack.creditStage]
  const investingReadiness = INVESTING_READINESS[stack.investingReadiness]
  const retirementColor = getRetirementStatusColor(stack.retirementGuidance.status)

  return (
    <EducationPanelProvider>
    <div className="min-h-screen bg-[#080A0F] pb-20">
      {/* Nav */}
      <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full bg-[#080A0F]/90 backdrop-blur-md border-b border-[#1C2030]">
        <Logo size="sm" />
        <Link href="/onboarding">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <RotateCcw className="w-3 h-3" />
            Update answers
          </Button>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-10 space-y-14">

        {/* ── Section 1: Archetype ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge variant={ARCHETYPE_BADGE_VARIANT[stack.primaryArchetype] ?? 'default'} className="mb-4">
            Your Archetype
          </Badge>
          <h1 className="text-4xl font-bold text-[#F0F2F8] tracking-tight leading-tight mb-2">
            {archetype.name}
          </h1>
          <p className="text-lg text-[#7C8599] mb-4">{archetype.tagline}</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {archetype.traits.map(trait => (
              <span
                key={trait}
                className="text-xs text-[#7C8599] border border-[#1C2030] bg-[#0E1018] rounded-full px-2.5 py-1"
              >
                {trait}
              </span>
            ))}
          </div>
          <p className="text-[#D0D5E8] leading-relaxed text-sm border-l-2 border-[#1C2030] pl-4">
            {stack.explanation}
          </p>

          {/* Status pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1C2030] bg-[#0E1018] px-3 py-1 text-xs text-[#7C8599]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#F5A623' }} />
              {creditStage.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1C2030] bg-[#0E1018] px-3 py-1 text-xs text-[#7C8599]">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C084FC' }} />
              {investingReadiness.name} · {stack.investingStyle}
            </span>
          </div>
        </motion.section>

        {/* ── Section 2: Stack Map ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label mb-4">
            Your Stack
          </p>
          <div className="space-y-2">
            <StackMapRow category="checking" rec={stack.checking.primary} support={stack.support.checking} comparisons={stack.comparisons.checking} alternatives={stack.checking.alternatives} index={0} />
            <StackMapRow category="savings" rec={stack.savings.primary} support={stack.support.savings} comparisons={stack.comparisons.savings} alternatives={stack.savings.alternatives} index={1} educationTopicId="apy" />
            <StackMapRow category="credit" rec={stack.credit.primary} support={stack.support.credit} comparisons={stack.comparisons.credit} alternatives={stack.credit.alternatives} index={2} educationTopicId="credit_score" />
            <StackMapRow category="investing" rec={stack.investingRecommendation} support={stack.support.investing} comparisons={[]} alternatives={[]} index={3} educationTopicId="compounding" />
          </div>
        </motion.section>

        {/* ── Section 3: Now vs Later ── */}
        <NowLaterSection planning={stack.planningLayer} />

        {/* Divider */}
        <div className="border-t border-[#1C2030]" />

        {/* ── Section 5: Retirement ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label mb-4">
            Retirement
          </p>
          <div className="rounded-2xl border border-[#1C2030] bg-[#0E1018] p-6">
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: retirementColor }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-[#F0F2F8]">
                    {stack.retirementGuidance.status}
                  </span>
                  <span className="text-xs text-[#4A5166]">·</span>
                  <span className="text-sm text-[#7C8599]">
                    {stack.retirementGuidance.action}
                  </span>
                </div>
                <p className="text-sm text-[#7C8599] leading-relaxed">
                  {stack.retirementGuidance.explanation}
                </p>
                <div className="mt-3">
                  <EducationTrigger topicId="roth_ira" label="What does a Roth IRA do?" />
                </div>
              </div>
            </div>

            {/* Retirement support layer */}
            <div className="mt-5 pt-5 border-t border-[#1C2030] space-y-2.5">
              <p className="text-xs text-[#4A5166] leading-relaxed">
                <span className="font-medium">Why this category — </span>
                {stack.support.retirement.categoryMatter}
              </p>
              <p className="text-xs text-[#4A5166] leading-relaxed">
                <span className="font-medium">Why this fits now — </span>
                {stack.support.retirement.fitNow}
              </p>
              <p className="text-xs text-[#4A5166] leading-relaxed">
                <span className="font-medium">Watch out for — </span>
                {stack.support.retirement.watchOut}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-[#1C2030]" />

        {/* ── Section 6: Action Plan ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label mb-5">
            Where to start
          </p>
          <div className="space-y-3">
            {stack.nextMoves.map((move, i) => (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => track('action_plan_step_clicked', { move_id: move.id, move_index: i, priority: move.priority })}
                className="flex gap-4 rounded-xl border border-[#1C2030] bg-[#0E1018] p-5 hover:border-[#2D3247] transition-colors duration-200 cursor-pointer"
              >
                {/* Step number */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `${PRIORITY_COLOR[move.priority]}15`,
                    color: PRIORITY_COLOR[move.priority],
                    border: `1px solid ${PRIORITY_COLOR[move.priority]}30`,
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-semibold text-[#F0F2F8] leading-snug">
                      {move.title}
                    </p>
                    <span className="text-xs text-[#4A5166] flex-shrink-0 mt-0.5">
                      {move.timeframe}
                    </span>
                  </div>
                  <p className="text-sm text-[#7C8599] leading-relaxed">{move.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Footer CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-center pt-4 pb-8"
        >
          <p className="text-sm text-[#4A5166] mb-4">
            Built for exactly where you are. Step one is the only one that matters right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/onboarding">
              <Button variant="outline" size="md" className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Update answers
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="md"
              className="text-[#4A5166] hover:text-[#7C8599] gap-1.5"
              onClick={() => {
                clearProfile()
                router.push('/')
              }}
            >
              Start fresh
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
    </EducationPanelProvider>
  )
}
