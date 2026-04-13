'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { QUESTIONS } from '@/lib/questions'
import type { UserAnswers } from '@/lib/types'

type PartialAnswers = Partial<UserAnswers>

const SLIDE = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<PartialAnswers>({})

  const question = QUESTIONS[step]
  const selectedId = answers[question.key] as string | undefined
  const progress = ((step) / QUESTIONS.length) * 100

  const selectOption = useCallback(
    (optionId: string) => {
      const newAnswers = { ...answers, [question.key]: optionId }
      setAnswers(newAnswers)

      // Auto-advance after brief delay
      setTimeout(() => {
        if (step < QUESTIONS.length - 1) {
          setDir(1)
          setStep((s) => s + 1)
        } else {
          // Final step — save and navigate
          localStorage.setItem('stackwise_answers', JSON.stringify(newAnswers))
          router.push('/results')
        }
      }, 280)
    },
    [answers, question.key, step, router]
  )

  const goBack = useCallback(() => {
    if (step > 0) {
      setDir(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-[#080A0F] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5B8BF5]" />
          <span className="text-sm font-medium text-[#7C8599]">Stackwise</span>
        </div>
        <span className="text-xs text-[#4A5166] tabular-nums">
          {step + 1} of {QUESTIONS.length}
        </span>
      </header>

      {/* Progress bar */}
      <div className="px-6 max-w-2xl mx-auto w-full">
        <Progress value={progress} max={100} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            {/* Question header */}
            <div className="mb-8">
              <p className="text-xs text-[#5B8BF5] uppercase tracking-widest font-medium mb-3">
                Question {step + 1}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F2F8] tracking-tight leading-tight mb-3">
                {question.title}
              </h2>
              <p className="text-[#7C8599] text-base leading-relaxed">
                {question.subtitle}
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((option, i) => {
                const isSelected = selectedId === option.id
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                    }}
                    onClick={() => selectOption(option.id)}
                    whileHover={{ scale: 1.015, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                    whileTap={{ scale: 0.985 }}
                    className={[
                      'group relative w-full text-left rounded-xl border p-4 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#5B8BF5]',
                      isSelected
                        ? 'border-[#5B8BF5] bg-[#1A2A4A] shadow-[0_0_0_1px_rgba(91,139,245,0.4),0_0_24px_rgba(91,139,245,0.08)]'
                        : 'border-[#1C2030] bg-[#0E1018] hover:border-[#2D3247] hover:bg-[#141720]',
                    ].join(' ')}
                  >
                    {/* Selected indicator */}
                    <div
                      className={[
                        'absolute top-4 right-4 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                        isSelected
                          ? 'border-[#5B8BF5] bg-[#5B8BF5]'
                          : 'border-[#2D3247] bg-transparent',
                      ].join(' ')}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </div>

                    <p
                      className={[
                        'font-medium text-sm pr-6 transition-colors duration-200',
                        isSelected ? 'text-[#F0F2F8]' : 'text-[#D0D5E8]',
                      ].join(' ')}
                    >
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-xs text-[#7C8599] mt-1 pr-6 leading-relaxed">
                        {option.description}
                      </p>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="px-6 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            onClick={goBack}
            disabled={step === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {selectedId && step < QUESTIONS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="md"
                onClick={() => {
                  setDir(1)
                  setStep((s) => s + 1)
                }}
                className="gap-1.5"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {selectedId && step === QUESTIONS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="md"
                onClick={() => {
                  localStorage.setItem('stackwise_answers', JSON.stringify(answers))
                  router.push('/results')
                }}
              >
                Build My Stack
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={[
                'rounded-full transition-all duration-300',
                i === step
                  ? 'w-4 h-1.5 bg-[#5B8BF5]'
                  : i < step
                  ? 'w-1.5 h-1.5 bg-[#2D3247]'
                  : 'w-1.5 h-1.5 bg-[#1C2030]',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
