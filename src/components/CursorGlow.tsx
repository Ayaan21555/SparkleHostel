import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CursorGlow() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const trailX = useMotionValue(-100)
  const trailY = useMotionValue(-100)

  // Main cursor — snappy
  const springX = useSpring(cursorX, { stiffness: 800, damping: 50 })
  const springY = useSpring(cursorY, { stiffness: 800, damping: 50 })

  // Trail — slow and dreamy
  const trailSpringX = useSpring(trailX, { stiffness: 80, damping: 20 })
  const trailSpringY = useSpring(trailY, { stiffness: 80, damping: 20 })

  const isVisible = useRef(false)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      trailX.set(e.clientX)
      trailY.set(e.clientY)
      isVisible.current = true
    }
    const hide = () => { cursorX.set(-100); cursorY.set(-100); trailX.set(-100); trailY.set(-100) }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', hide)
    }
  }, [])

  // Only show on non-touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  return (
    <>
      {/* Large soft glow trail */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: trailSpringX,
          y: trailSpringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div
          className="w-64 h-64 rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* Medium glow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div
          className="w-8 h-8 rounded-full opacity-30 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
      </motion.div>

      {/* Small sharp dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <div
          className="w-2 h-2 rounded-full bg-primary opacity-80"
        />
      </motion.div>
    </>
  )
}
