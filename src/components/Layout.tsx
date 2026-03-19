import React, { useState, useEffect } from 'react'
import { IntroSequence } from '@/components/IntroSequence'
import { Navbar } from '@/components/Navbar'
import { CursorGlow } from '@/components/CursorGlow'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export function replayIntro() {
  sessionStorage.removeItem('has-seen-intro')
  window.dispatchEvent(new CustomEvent('replay-intro'))
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('has-seen-intro')
    if (hasSeenIntro) setShowIntro(false)
  }, [])

  useEffect(() => {
    const handler = () => setShowIntro(true)
    window.addEventListener('replay-intro', handler)
    return () => window.removeEventListener('replay-intro', handler)
  }, [])

  const handleIntroComplete = () => {
    setShowIntro(false)
    sessionStorage.setItem('has-seen-intro', 'true')
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      {/* Cursor glow — works across all themes */}
      <CursorGlow />

      <AnimatePresence>
        {showIntro && <IntroSequence onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 w-full pt-20">
        <AnimatePresence mode="wait">
          {!showIntro && (
            <motion.div
              key="page-content"
              initial={{ opacity: 0, y: 16, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
