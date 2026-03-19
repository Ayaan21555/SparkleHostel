import React from 'react'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { Pricing } from '../components/Pricing'
import { StudentFeedback } from '../components/StudentFeedback'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Layout } from '../components/Layout'
import { Sparkles } from 'lucide-react'
import { SparkleOrbitLogo } from '../components/SparkleOrbitLogo'

export default function Home() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <Layout>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      <Hero />
      <Features />
      <Pricing />
      <StudentFeedback />

      {/* Trusted by section */}
      <section className="py-24 px-6 md:px-20 text-center glass border-y border-border/40">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-4xl font-serif mb-12"
        >
          Trusted by <span className="text-primary italic font-normal">Our Hostel</span> Community.
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {['Block A', 'Block B', 'Block C', 'Common Wing', 'New Block'].map((name, i) => (
            <span key={i} className="text-2xl font-serif font-bold tracking-widest uppercase">{name}</span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-20 flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground border-t border-border/40">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <SparkleOrbitLogo size="sm" showStreaks={false} />
            <span className="text-xl font-bold tracking-tighter">Sparkle Hostel</span>
          </div>
          <span className="text-sm">© 2024 All rights reserved.</span>
        </div>

        <div className="flex gap-8 text-sm font-medium">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
        </div>
      </footer>
    </Layout>
  )
}
