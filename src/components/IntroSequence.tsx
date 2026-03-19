import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useAppTheme } from '@/context/ThemeContext'

interface Particle {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  drift: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 4,
    drift: (Math.random() - 0.5) * 120,
  }))
}

const STEPS = [
  {
    id: 'step0',
    duration: 2500,
    content: {
      eyebrow: 'WELCOME TO',
      headline: 'Efficiency',
      sub: 'Redefined for Modern Living',
      accent: 'Your hostel. Your schedule.',
    },
  },
  {
    id: 'step1',
    duration: 2500,
    content: {
      eyebrow: 'INTRODUCING',
      headline: 'Premium Care',
      sub: 'Smart laundry. Seamless booking.',
      accent: 'Built for girls who mean business.',
    },
  },
  {
    id: 'step2',
    duration: 2500,
    content: {
      eyebrow: 'EXPERIENCE',
      headline: 'Sparkle Hostel Suite',
      sub: 'The future of hostel laundry management',
      accent: 'Slot Booking & Laundry Management',
    },
  },
]

export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const { theme } = useAppTheme()
  const [particles] = useState(() => generateParticles(25))
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const stepRef = useRef<NodeJS.Timeout | null>(null)

  const isCyberpunk = theme === 'cyberpunk'
  const isDark = theme === 'dark'

  useEffect(() => {
    setProgress(0)
    const duration = STEPS[step]?.duration ?? 2500
    const startTime = Date.now()

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setProgress(Math.min((elapsed / duration) * 100, 100))
    }, 16)

    stepRef.current = setTimeout(() => {
      clearInterval(progressRef.current!)
      if (step < STEPS.length - 1) {
        setStep(s => s + 1)
      } else {
        onComplete()
      }
    }, duration)

    return () => {
      clearInterval(progressRef.current!)
      clearTimeout(stepRef.current!)
    }
  }, [step, onComplete])

  const themeColors = {
    rose:      { bg: '#fff1f3', orb1: '#f43f5e', orb2: '#fb923c', text: '#e11d48' },
    ocean:     { bg: '#f0fdfa', orb1: '#0d9488', orb2: '#06b6d4', text: '#0f766e' },
    dark:      { bg: '#0d0f1a', orb1: '#7c3aed', orb2: '#0ea5e9', text: '#a78bfa' },
    cyberpunk: { bg: '#08020f', orb1: '#e8006e', orb2: '#00eeff', text: '#ff006e' },
  }[theme]

  const stepData = STEPS[step].content

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center"
      style={{ background: themeColors.bg }}
    >
      {/* Animated background orbs */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute rounded-full blur-[120px] opacity-30"
          style={{
            width: '60vw', height: '60vw',
            background: themeColors.orb1,
            top: '-20%', left: '-10%',
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-[100px] opacity-25"
          style={{
            width: '50vw', height: '50vw',
            background: themeColors.orb2,
            bottom: '-15%', right: '-5%',
          }}
          animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {isCyberpunk && (
          <>
            {/* Cyberpunk grid lines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,238,255,0.07) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,238,255,0.07) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
            {/* Horizontal scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[2px] opacity-60"
              style={{ background: 'linear-gradient(90deg, transparent, #00eeff, transparent)' }}
              animate={{ top: ['-5%', '105%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              bottom: '-20px',
              width: p.size,
              height: p.size,
              background: isCyberpunk
                ? (p.id % 2 === 0 ? '#ff006e' : '#00eeff')
                : themeColors.orb1,
              opacity: 0.6,
            }}
            animate={{
              y: [`0px`, `${-(600 + Math.random() * 200)}px`],
              x: [0, p.drift],
              opacity: [0.6, 0.3, 0],
              scale: [1, 0.5, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-3xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[step].id}
            initial={{ opacity: 0, y: 60, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -60, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.3em' }}
              animate={{ opacity: 1, letterSpacing: '0.4em' }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs font-semibold tracking-[0.4em] uppercase"
              style={{ color: themeColors.text, opacity: 0.7 }}
            >
              {stepData.eyebrow}
            </motion.p>

            {/* Main headline with letter-by-letter animation */}
            <motion.div className="overflow-hidden">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`font-serif italic leading-none ${
                  step === 2 ? 'text-6xl md:text-8xl' : 'text-5xl md:text-7xl'
                } ${isCyberpunk ? 'font-black not-italic' : ''}`}
                style={{
                  color: themeColors.text,
                  fontFamily: isCyberpunk ? '"Orbitron", monospace' : undefined,
                  textShadow: isCyberpunk
                    ? `0 0 20px ${themeColors.text}, 0 0 60px ${themeColors.text}80`
                    : 'none',
                }}
                data-text={stepData.headline}
              >
                {step === 2 ? (
                  // Sparkle Hostel Suite — split into two colored parts
                  <>
                    <span style={{ color: themeColors.orb1 }}>Sparkle</span>
                    <span style={{ color: themeColors.orb2 }}> Hostel</span>
                    <span style={{ opacity: 0.85 }}> Suite</span>
                  </>
                ) : (
                  stepData.headline
                )}
              </motion.h1>
            </motion.div>

            {/* Animated divider */}
            <div className="flex items-center justify-center gap-3 my-2">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  height: 2,
                  width: 60,
                  background: `linear-gradient(90deg, transparent, ${themeColors.orb1})`,
                  transformOrigin: 'right',
                }}
              />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="w-3 h-3 rounded-full"
                style={{ background: themeColors.text }}
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  height: 2,
                  width: 60,
                  background: `linear-gradient(90deg, ${themeColors.orb2}, transparent)`,
                  transformOrigin: 'left',
                }}
              />
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-base md:text-xl font-light"
              style={{ color: themeColors.text, opacity: 0.75 }}
            >
              {stepData.sub}
            </motion.p>

            {/* Accent tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mt-2"
              style={{
                background: `${themeColors.orb1}18`,
                border: `1px solid ${themeColors.orb1}40`,
                color: themeColors.orb1,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: themeColors.orb1 }}
              />
              {stepData.accent}
            </motion.div>

            {/* Morphing blob decoration */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.12, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute -z-10 blur-3xl"
                style={{
                  width: '300px',
                  height: '300px',
                  background: `radial-gradient(circle, ${themeColors.orb1}, ${themeColors.orb2})`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'morph-blob 6s ease-in-out infinite',
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Step indicators + progress */}
        <div className="absolute bottom-12 left-0 right-0 px-8">
          {/* Progress bar */}
          <div
            className="h-[2px] rounded-full overflow-hidden mb-6 mx-auto"
            style={{ maxWidth: 300, background: `${themeColors.text}20` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${themeColors.orb1}, ${themeColors.orb2})`,
                width: `${progress}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.id}
                animate={{
                  width: i === step ? 32 : 8,
                  opacity: i <= step ? 1 : 0.3,
                }}
                transition={{ duration: 0.4 }}
                className="h-2 rounded-full"
                style={{
                  background: i === step
                    ? `linear-gradient(90deg, ${themeColors.orb1}, ${themeColors.orb2})`
                    : themeColors.text,
                }}
              />
            ))}
          </div>

          {/* Step counter */}
          <motion.p
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="text-center text-xs mt-4 font-mono tracking-widest"
            style={{ color: themeColors.text }}
          >
            {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </motion.p>
        </div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
          whileHover={{ opacity: 1 }}
          onClick={onComplete}
          className="absolute bottom-8 right-8 text-xs tracking-wider uppercase font-medium"
          style={{ color: themeColors.text }}
        >
          Skip →
        </motion.button>
      </div>
    </div>
  )
}
