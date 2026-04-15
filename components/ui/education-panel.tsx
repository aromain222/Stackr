'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTopicById, searchTopics, EDUCATION_TOPICS } from '@/lib/education'
import type { EducationTopic } from '@/lib/education'

// ─── Context ───────────────────────────────────────────────────────────────────

interface EducationContextValue {
  openTopic: (id: string) => void
  closeTopic: () => void
  activeTopic: EducationTopic | null
}

const EducationContext = createContext<EducationContextValue | null>(null)

function useEducation(): EducationContextValue {
  const ctx = useContext(EducationContext)
  if (!ctx) throw new Error('useEducation must be used within EducationPanelProvider')
  return ctx
}

// ─── Category color map ────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  savings: '#00D4A0',
  credit: '#F5A623',
  investing: '#C084FC',
  banking: '#5B8BF5',
  retirement: '#C084FC',
}

// ─── Related topics ────────────────────────────────────────────────────────────

function RelatedTopics({
  current,
  onSelect,
}: {
  current: EducationTopic
  onSelect: (id: string) => void
}) {
  const related = EDUCATION_TOPICS.filter(
    (t) => t.id !== current.id && t.category === current.category
  )
  if (!related.length) return null

  return (
    <div className="mb-5">
      <p className="text-xs text-[#4A5166] mb-2.5">Related topics</p>
      <div className="flex flex-wrap gap-2">
        {related.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className="text-xs text-[#7C8599] border border-[#1C2030] bg-[#141720] rounded-full px-3 py-1 hover:text-[#F0F2F8] hover:border-[#2D3247] transition-colors"
          >
            {t.term}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Panel ─────────────────────────────────────────────────────────────────────

function EducationPanel() {
  const { activeTopic, closeTopic, openTopic } = useEducation()

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset input state when topic changes
  useEffect(() => {
    setQuery('')
    setAiAnswer(null)
    setAiError(null)
  }, [activeTopic?.id])

  // Escape key handler
  useEffect(() => {
    if (!activeTopic) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTopic()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeTopic, closeTopic])

  // Focus input after panel opens
  useEffect(() => {
    if (!activeTopic) return
    const timer = setTimeout(() => inputRef.current?.focus(), 350)
    return () => clearTimeout(timer)
  }, [activeTopic])

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) return

    setAiAnswer(null)
    setAiError(null)
    setSearching(true)

    // Try keyword match first
    const matched = searchTopics(trimmed)
    if (matched) {
      setSearching(false)
      setQuery('')
      openTopic(matched.id)
      return
    }

    // Fallback: POST /api/explain
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { answer?: string; error?: string }
      if (data.answer) {
        setAiAnswer(data.answer)
      } else {
        setAiError(data.error ?? 'Unable to answer right now.')
      }
    } catch {
      setAiError('Unable to connect. Check your internet connection.')
    } finally {
      setSearching(false)
    }
  }

  const accentColor = activeTopic
    ? (CATEGORY_COLOR[activeTopic.category] ?? '#5B8BF5')
    : '#5B8BF5'

  return (
    <AnimatePresence>
      {activeTopic && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#080A0F]/70 backdrop-blur-sm"
            onClick={closeTopic}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Learn about ${activeTopic.term}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-2xl bg-[#0E1018] border border-[#1C2030] border-b-0 overflow-hidden"
            style={{ maxHeight: '85vh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#1C2030]" />
            </div>

            {/* Scrollable content */}
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: 'calc(85vh - 2.5rem)' }}
            >
              <div className="px-6 pb-8 pt-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span
                      className="text-xs font-semibold uppercase tracking-widest block mb-1"
                      style={{ color: accentColor }}
                    >
                      {activeTopic.category}
                    </span>
                    <h2 className="text-xl font-bold text-[#F0F2F8]">{activeTopic.term}</h2>
                  </div>
                  <button
                    onClick={closeTopic}
                    aria-label="Close"
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#141720] hover:bg-[#1C2030] text-[#7C8599] hover:text-[#F0F2F8] transition-colors mt-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Accent line */}
                <div
                  className="h-0.5 w-full rounded-full mb-5"
                  style={{ backgroundColor: accentColor, opacity: 0.4 }}
                />

                {/* Definition */}
                <div className="rounded-xl bg-[#141720] border border-[#1C2030] p-4 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#4A5166] mb-2">
                    What it is
                  </p>
                  <p className="text-sm text-[#D0D5E8] leading-relaxed">
                    {activeTopic.definition}
                  </p>
                </div>

                {/* Why it matters */}
                <div
                  className="rounded-xl border p-4 mb-3"
                  style={{
                    backgroundColor: `${accentColor}0D`,
                    borderColor: `${accentColor}30`,
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: accentColor }}
                  >
                    Why it matters
                  </p>
                  <p className="text-sm text-[#D0D5E8] leading-relaxed">
                    {activeTopic.whyItMatters}
                  </p>
                </div>

                {/* Example */}
                <div className="rounded-xl bg-[#141720] border border-[#1C2030] p-4 mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#4A5166] mb-2">
                    Real example
                  </p>
                  <p className="text-[13px] text-[#7C8599] leading-relaxed font-mono">
                    {activeTopic.example}
                  </p>
                </div>

                {/* Related topics */}
                <RelatedTopics current={activeTopic} onSelect={openTopic} />

                {/* AI answer */}
                {aiAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#5B8BF5]/30 bg-[#5B8BF5]/5 p-4 mb-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#5B8BF5] mb-2">
                      AI explanation
                    </p>
                    <p className="text-sm text-[#D0D5E8] leading-relaxed">{aiAnswer}</p>
                  </motion.div>
                )}

                {aiError && (
                  <p className="text-xs text-[#F56060] mb-4 px-1">{aiError}</p>
                )}

                {/* Ask a question */}
                <div className="border-t border-[#1C2030] pt-5">
                  <p className="text-xs text-[#4A5166] mb-3">
                    Have a question about this or another topic?
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch()
                      }}
                      placeholder="e.g. How does credit utilization work?"
                      disabled={searching}
                      className={cn(
                        'flex-1 rounded-xl bg-[#141720] border border-[#1C2030] px-4 py-2.5 text-sm text-[#F0F2F8] placeholder:text-[#4A5166]',
                        'focus:outline-none focus:border-[#2D3247] focus:ring-1 focus:ring-[#5B8BF5]/30',
                        'disabled:opacity-50 transition-colors'
                      )}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={!query.trim() || searching}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center',
                        'bg-[#141720] border border-[#1C2030] text-[#7C8599]',
                        'hover:border-[#2D3247] hover:text-[#F0F2F8]',
                        'disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                    >
                      {searching ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-[#4A5166] border-t-[#5B8BF5] rounded-full"
                        />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function EducationPanelProvider({ children }: { children: React.ReactNode }) {
  const [activeTopic, setActiveTopic] = useState<EducationTopic | null>(null)

  const openTopic = useCallback((id: string) => {
    const topic = getTopicById(id)
    if (topic) setActiveTopic(topic)
  }, [])

  const closeTopic = useCallback(() => {
    setActiveTopic(null)
  }, [])

  // Lock body scroll when panel is open
  useEffect(() => {
    if (activeTopic) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeTopic])

  return (
    <EducationContext.Provider value={{ openTopic, closeTopic, activeTopic }}>
      {children}
      <EducationPanel />
    </EducationContext.Provider>
  )
}

// ─── Trigger ───────────────────────────────────────────────────────────────────

interface EducationTriggerProps {
  topicId: string
  label: string
  className?: string
}

export function EducationTrigger({ topicId, label, className }: EducationTriggerProps) {
  const { openTopic } = useEducation()

  return (
    <button
      onClick={() => openTopic(topicId)}
      className={cn(
        'text-xs text-[#4A5166] underline decoration-dotted underline-offset-2',
        'hover:text-[#7C8599] transition-colors duration-150 cursor-pointer',
        className
      )}
    >
      {label}
    </button>
  )
}
