import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Calendar, Clock, Database, ShieldCheck, Zap, WashingMachine } from 'lucide-react'
import { AnimatedWords } from './AnimatedText'

const features = [
  {
    title: 'Real-time Booking',
    description: 'Instantly book any of the 4 available washing machines for your preferred 30-minute slot.',
    icon: Calendar,
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    title: 'Live Availability',
    description: 'Check the current status of each machine and next available slots in real-time.',
    icon: Zap,
    color: 'from-yellow-500/20 to-yellow-600/5',
  },
  {
    title: 'Laundry Service',
    description: 'Submit your laundry items with quantities and get them cleaned professionally.',
    icon: WashingMachine,
    color: 'from-green-500/20 to-green-600/5',
  },
  {
    title: 'Waiting List',
    description: 'If slots are full, join the automated waiting list and get notified instantly.',
    icon: Clock,
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    title: 'Warden Controls',
    description: 'Role-based access for wardens to manage students, approve orders and book slots.',
    icon: ShieldCheck,
    color: 'from-red-500/20 to-red-600/5',
  },
  {
    title: 'Secure & Fast',
    description: 'Your data is safe with Supabase backend. Everything loads instantly.',
    icon: Database,
    color: 'from-cyan-500/20 to-cyan-600/5',
  },
]

// 3D tilt card on hover
function TiltCard({ children, delay }: { children: React.ReactNode; delay: number; key?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-50, 50], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-50, 50], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

export function Features() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section ref={containerRef} id="features" className="py-32 relative overflow-hidden bg-background">

      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4">
        <motion.div style={{ y }} className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-primary font-bold uppercase tracking-widest text-xs mb-4 inline-block"
          >
            Features
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            <AnimatedWords
              text="Empowering Hostel Living"
              className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-primary"
              delay={0.1}
            />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl mx-auto text-muted-foreground text-lg italic font-serif"
          >
            Designed for efficiency and ease, Sparkle Hostel handles everything from machine slots to professional laundry.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <TiltCard key={feature.title} delay={i * 0.08}>
              <Card className="h-full glass relative overflow-hidden group border-border/40 hover:border-primary/40 transition-colors duration-500">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <CardHeader className="flex flex-col items-center gap-4 text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-elegant"
                  >
                    <feature.icon className="w-8 h-8" />
                  </motion.div>
                  <CardTitle className="text-xl font-bold tracking-tight">{feature.title}</CardTitle>
                </CardHeader>

                <CardContent className="text-center relative z-10">
                  <p className="text-muted-foreground leading-relaxed italic font-serif group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ transform: 'skewX(-20deg) translateX(-100%)' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6 }}
                />
              </Card>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
