import React from 'react'
import { motion } from 'framer-motion'
import { WashingMachine } from 'lucide-react'

// Replaced 3D washing machine with a clean animated SVG version
export function AnimatedStone({ status, className }: { status?: 'available' | 'booked' | 'waiting', className?: string }) {
  const color = status === 'available'
    ? 'hsl(180, 75%, 40%)'
    : status === 'booked'
      ? 'hsl(343, 75%, 50%)'
      : 'hsl(60, 100%, 50%)'

  const bgClass = status === 'available'
    ? 'bg-teal-500/20 border-teal-500/40'
    : status === 'booked'
      ? 'bg-primary/20 border-primary/40'
      : 'bg-yellow-500/20 border-yellow-500/40'

  return (
    <div className={className}>
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-full h-full flex items-center justify-center rounded-xl border-2 ${bgClass}`}
      >
        <motion.div
          animate={{ rotate: status === 'available' ? [0, 360] : 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <WashingMachine className="w-10 h-10" style={{ color }} />
        </motion.div>
      </motion.div>
    </div>
  )
}
