import React from 'react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  subtitle: string
  gradient?: boolean
}

export function PageHeader({ title, subtitle, gradient = true }: PageHeaderProps) {
  return (
    <div className="mb-12 relative">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 className={`text-4xl md:text-6xl font-bold tracking-tight mb-4 ${gradient ? 'gradient-text' : ''}`}>
          {title}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      </motion.div>
      
      {/* Decorative element */}
      <motion.div 
        className="absolute -top-6 -left-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl -z-10"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  )
}
