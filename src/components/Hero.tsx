import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronRight, Sparkles, WashingMachine } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AnimatedWords } from './AnimatedText'
import { SparkleOrbitLogo } from '@/components/SparkleOrbitLogo'

// Magnetic button — follows cursor slightly on hover
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 25 })
  const springY = useSpring(y, { stiffness: 300, damping: 25 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.3)
    y.set((e.clientY - centerY) * 0.3)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex pt-32 pb-32 items-center justify-center overflow-hidden live-bg">

      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 270, 180, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-secondary/15 blur-2xl"
        />

        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeInOut',
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 25}%` }}
          />
        ))}

        {/* Horizontal line accents */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.15 }}
          transition={{ duration: 2, delay: 1, ease: 'easeOut' }}
          className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent origin-left"
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.1 }}
          transition={{ duration: 2, delay: 1.3, ease: 'easeOut' }}
          className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent origin-right"
        />
      </div>

      {/* Main content */}
      <div className="container relative z-10 mx-auto px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          <motion.span
            animate={{ boxShadow: ['0 0 0px hsl(var(--primary)/0)', '0 0 20px hsl(var(--primary)/0.3)', '0 0 0px hsl(var(--primary)/0)'] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase flex items-center gap-2 border border-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sparkle Hostel — Next-Gen Slot Booking
          </motion.span>
        </motion.div>

        {/* Main heading with Logo centered above */}
        <div className="flex flex-col justify-center items-center gap-6 mb-8 max-w-6xl mx-auto">
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0"
          >
            <SparkleOrbitLogo size="md" showStreaks={true} />
          </motion.div>

          {/* Matches IntroSequence.tsx precisely */}
          <h1 className="font-serif italic text-5xl md:text-6xl lg:text-[6rem] leading-none text-center text-primary filter drop-shadow-md pb-4">
            <AnimatedWords
              text="Sparkle Hostel"
              delay={0.2}
            />
          </h1>
        </div>

        {/* Subtitle — slides up with blur */}
        <motion.p
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed font-serif italic"
        >
          Revolutionizing hostel life with seamless slot booking and premium laundry services.
          Efficiency at your fingertips.
        </motion.p>

        {/* Magnetic CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <MagneticButton>
            <Link to="/login">
              <Button
                size="lg"
                className="h-14 px-10 text-lg rounded-full shadow-glow group relative overflow-hidden"
              >
                <motion.span
                  className="absolute inset-0 bg-white/10 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                Book a Slot
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </MagneticButton>

          <MagneticButton>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg rounded-full glass hover:bg-white/5 group"
              >
                <WashingMachine className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Laundry Services
              </Button>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="flex items-center justify-center gap-12 mt-16"
        >
          {[
            { value: '4', label: 'Machines' },
            { value: '24/7', label: 'Available' },
            { value: '30m', label: 'Per Slot' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator - slightly lower so it doesn't overlap */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full p-1">
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 bg-primary rounded-full mx-auto"
          />
        </div>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] text-muted-foreground/60 uppercase tracking-widest"
        >
          Scroll to Explore
        </motion.span>
      </div>
    </section>
  )
}
