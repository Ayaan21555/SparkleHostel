import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  once?: boolean
}

// Splits text into words and animates each one up with stagger
export function AnimatedWords({ text, className = '', delay = 0, once = true }: AnimatedTextProps) {
  const words = text.split(' ')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  }

  const child = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.span
      className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={child} className="inline-block overflow-hidden">
          <motion.span className="inline-block">{word}</motion.span>
        </motion.span>
      ))}
    </motion.span>
  )
}

// Typing cursor effect
export function TypewriterText({ text, className = '', delay = 0 }: AnimatedTextProps) {
  const [displayed, setDisplayed] = React.useState('')
  const [started, setStarted] = React.useState(false)

  React.useEffect(() => {
    if (!started) return
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(timer)
    }, 45)
    return () => clearInterval(timer)
  }, [started, text])

  return (
    <motion.span
      className={className}
      onViewportEnter={() => setTimeout(() => setStarted(true), delay * 1000)}
    >
      {displayed}
      {displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-primary ml-0.5 align-middle"
        />
      )}
    </motion.span>
  )
}
