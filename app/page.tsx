'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Layers, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loadMeta, loadAnswers, clearProfile, formatSavedDate } from '@/lib/storage'
import type { SavedMeta } from '@/lib/storage'

const STACK_PREVIEW = [
  {
    label: 'Cash',
    description: 'Fee-free checking',
    color: '#5B8BF5',
    example: 'Capital One · SoFi · Chase',
  },
  {
    label: 'Save',
    description: 'High-yield savings',
    color: '#00D4A0',
    example: 'Ally · SoFi · Amex',
  },
  {
    label: 'Credit',
    description: 'Card matched to your profile',
    color: '#F5A623',
    example: 'Discover · Chase · Amex',
  },
  {
    label: 'Grow',
    description: 'Investing & retirement',
    color: '#C084FC',
    example: 'Fidelity FZROX · Roth IRA',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function WelcomePage() {
  const router = useRouter()
  const [meta, setMeta] = useState<SavedMeta | null>(null)
  const [hasAnswers, setHasAnswers] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMeta(loadMeta())
    setHasAnswers(loadAnswers() !== null)
    setMounted(true)
  }, [])

  function handleStartFresh() {
    clearProfile()
    setMeta(null)
    setHasAnswers(false)
  }

  const isReturning = mounted && hasAnswers

  return (
    <main className="min-h-screen bg-[#080A0F] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#5B8BF5]" />
          <span className="font-semibold text-[#F0F2F8] tracking-tight">Stackwise</span>
        </div>
        <span className="text-xs text-[#4A5166] uppercase tracking-widest font-medium">
          Free · No account required
        </span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-2xl w-full mx-auto text-center"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1C2030] bg-[#0E1018] px-4 py-1.5 text-xs text-[#7C8599] uppercase tracking-widest font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A0] animate-pulse" />
              Checking · Savings · Credit · Investing
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-bold text-[#F0F2F8] tracking-tight leading-[1.1] mb-6 text-balance"
          >
            Build your{' '}
            <span className="gradient-text">financial stack</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-lg text-[#7C8599] leading-relaxed mb-10 max-w-lg mx-auto text-balance"
          >
            Answer 8 questions. Get matched to the right accounts across checking, savings, credit, and investing — each with a specific explanation of why it fits your situation.
          </motion.p>

          {/* CTA — branches on return user state */}
          <motion.div variants={fadeUp} className="mb-4">
            {isReturning ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/results">
                  <Button size="xl" className="group">
                    View my stack
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button size="xl" variant="outline">
                    Update answers
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/onboarding">
                <Button size="xl" className="group">
                  Build My Stack
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Meta row — return user info or new user disclaimer */}
          <motion.div variants={fadeUp} className="h-5 flex items-center justify-center">
            {isReturning ? (
              <p className="text-xs text-[#4A5166] flex items-center gap-2">
                {meta
                  ? `${meta.archetypeName} profile · Updated ${formatSavedDate(meta.savedAt)}`
                  : 'Previous answers found'}
                <span className="text-[#2D3247]">·</span>
                <button
                  onClick={handleStartFresh}
                  className="text-[#4A5166] hover:text-[#7C8599] transition-colors duration-150 inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Start fresh
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#4A5166]">
                2 minutes · No account required · Completely free
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Stack Preview */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl w-full mx-auto mt-20"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs text-[#4A5166] uppercase tracking-widest font-medium text-center mb-5"
          >
            What's included
          </motion.p>

          <div className="space-y-2">
            {STACK_PREVIEW.map((layer, i) => (
              <motion.div
                key={layer.label}
                variants={fadeUp}
                custom={i}
                className="flex items-center gap-4 rounded-xl border border-[#1C2030] bg-[#0E1018] px-5 py-4 group hover:border-[#2D3247] transition-colors duration-200"
              >
                {/* Accent bar */}
                <div
                  className="w-0.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />

                {/* Labels */}
                <div className="flex items-baseline gap-3 min-w-0 flex-1">
                  <span
                    className="text-sm font-semibold uppercase tracking-widest flex-shrink-0"
                    style={{ color: layer.color }}
                  >
                    {layer.label}
                  </span>
                  <span className="text-sm text-[#7C8599] truncate">
                    {layer.description}
                  </span>
                </div>

                {/* Example */}
                <span className="text-xs text-[#4A5166] flex-shrink-0 hidden sm:block">
                  {layer.example}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            className="text-center text-xs text-[#4A5166] mt-6"
          >
            Every pick includes a specific explanation — and a clear reason why the alternatives didn't make the cut.
          </motion.p>
        </motion.div>
      </div>
    </main>
  )
}
