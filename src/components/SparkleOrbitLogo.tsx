import React, { useEffect, useRef } from 'react'
import { useAppTheme } from '@/context/ThemeContext'

interface SparkleOrbitLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showStreaks?: boolean
  className?: string
}

// Theme color map — matches index.css theme variables
const THEME_COLORS: Record<string, { primary: string; glow: string; accent: string; bg: string }> = {
  rose:      { primary: '#f43f5e', glow: '#ff1f5a',  accent: '#ffd700', bg: '#fff1f3' },
  ocean:     { primary: '#0d9488', glow: '#06b6d4',  accent: '#38bdf8', bg: '#f0fdfa' },
  dark:      { primary: '#7c3aed', glow: '#0ea5e9',  accent: '#a78bfa', bg: '#0d0f1a' },
  cyberpunk: { primary: '#e8006e', glow: '#00eeff',  accent: '#ffd700', bg: '#08020f' },
}

export function SparkleOrbitLogo({ size = 'md', showStreaks = false, className = '' }: SparkleOrbitLogoProps) {
  const { theme } = useAppTheme()
  const streakRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const colors = THEME_COLORS[theme] ?? THEME_COLORS.rose

  // Size presets
  const sizeMap = {
    sm: { stage: 48,  rings: [23, 34, 48],  counter: [29, 42],  nodeMax: 6,  star: 16 },
    md: { stage: 160, rings: [77, 115, 160], counter: [96, 140], nodeMax: 10, star: 54 },
    lg: { stage: 340, rings: [162, 244, 340],counter: [204, 300], nodeMax: 16, star: 110 },
  }[size]

  // Light streaks — only on lg/showStreaks
  useEffect(() => {
    if (!showStreaks || !streakRef.current) return
    const field = streakRef.current

    const createStreak = () => {
      const streak = document.createElement('div')
      const y = Math.random() * 100
      const deg = (Math.random() - 0.5) * 60
      const dur = 0.5 + Math.random() * 0.5

      Object.assign(streak.style, {
        position: 'fixed',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
        filter: 'blur(1px)',
        opacity: '0.7',
        pointerEvents: 'none',
        top: `${y}vh`,
        left: '-20%',
        animation: `sparkle-streak-warp ${dur}s linear forwards`,
        '--y': `${y}vh`,
        '--deg': `${deg}deg`,
        zIndex: '1',
      } as any)

      field.appendChild(streak)
      setTimeout(() => streak.remove(), dur * 1000)
    }

    intervalRef.current = setInterval(createStreak, 75)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [showStreaks, colors.glow])

  const gradId = `ring-grad-${theme}-${size}`

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: sizeMap.stage, height: sizeMap.stage }}
    >
      {/* Streak field */}
      {showStreaks && (
        <div
          ref={streakRef}
          style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}
        />
      )}

      {/* SVG defs (hidden) */}
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: colors.glow, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Stage */}
      <div
        style={{
          position: 'relative',
          width: sizeMap.stage,
          height: sizeMap.stage,
        }}
      >
        {/* ── Counter-rotating rings (slow, subtle) ── */}
        {/* Counter 1 */}
        <div
          style={{
            position: 'absolute',
            width: sizeMap.counter[0],
            height: sizeMap.counter[0],
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle-spin-ccw 18s linear infinite',
            opacity: 0.55,
          }}
        >
          <svg style={{ width: '100%', height: '100%', fill: 'none' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Counter 2 */}
        <div
          style={{
            position: 'absolute',
            width: sizeMap.counter[1],
            height: sizeMap.counter[1],
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle-spin-ccw 28s linear infinite',
            opacity: 0.4,
          }}
        >
          <svg style={{ width: '100%', height: '100%', fill: 'none' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2"
              strokeDasharray="5 15"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* ── Ring 1 (innermost, fastest) ── */}
        <div
          style={{
            position: 'absolute',
            width: sizeMap.rings[0],
            height: sizeMap.rings[0],
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle-spin-cw 2s linear infinite',
          }}
        >
          <svg
            style={{
              width: '100%', height: '100%', fill: 'none',
              filter: `drop-shadow(0 0 ${size === 'sm' ? 4 : 8}px ${colors.glow})`,
            }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48"
              stroke={`url(#${gradId})`}
              strokeWidth="2.5"
              strokeDasharray="10 5"
              strokeLinecap="round"
            />
          </svg>
          {/* Nodes on ring 1 */}
          <OrbNode size={sizeMap.nodeMax * 0.8} color={colors.glow} style={{ top: -sizeMap.nodeMax * 0.4, left: '50%', transform: 'translateX(-50%)' }} />
          {size !== 'sm' && <OrbNode size={sizeMap.nodeMax * 0.45} color={colors.glow} style={{ bottom: -sizeMap.nodeMax * 0.22, left: '50%', transform: 'translateX(-50%)', opacity: 0.7 }} />}
        </div>

        {/* ── Ring 2 (middle) ── */}
        <div
          style={{
            position: 'absolute',
            width: sizeMap.rings[1],
            height: sizeMap.rings[1],
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle-spin-cw 4s linear infinite',
          }}
        >
          <svg
            style={{
              width: '100%', height: '100%', fill: 'none',
              filter: `drop-shadow(0 0 ${size === 'sm' ? 4 : 10}px ${colors.glow})`,
            }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48"
              stroke={`url(#${gradId})`}
              strokeWidth="2"
              strokeDasharray="20 10"
              strokeLinecap="round"
            />
          </svg>
          <OrbNode size={sizeMap.nodeMax} color={colors.glow} style={{ top: -sizeMap.nodeMax / 2, left: '50%', transform: 'translateX(-50%)' }} />
          {size !== 'sm' && <OrbNode size={sizeMap.nodeMax * 0.6} color={colors.accent} style={{ bottom: -sizeMap.nodeMax * 0.3, right: '15%', opacity: 0.8 }} />}
        </div>

        {/* ── Ring 3 (outermost, slowest) ── */}
        <div
          style={{
            position: 'absolute',
            width: sizeMap.rings[2],
            height: sizeMap.rings[2],
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle-spin-cw 8s linear infinite',
            opacity: size === 'sm' ? 0.7 : 1,
          }}
        >
          <svg
            style={{
              width: '100%', height: '100%', fill: 'none',
              filter: `drop-shadow(0 0 ${size === 'sm' ? 3 : 8}px ${colors.glow})`,
            }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="48"
              stroke={`url(#${gradId})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          {size !== 'sm' && (
            <>
              <OrbNode size={sizeMap.nodeMax * 0.7} color={colors.glow} style={{ top: -sizeMap.nodeMax * 0.35, left: '50%', transform: 'translateX(-50%)' }} />
              <OrbNode size={sizeMap.nodeMax * 0.9} color={colors.accent} style={{ bottom: -sizeMap.nodeMax * 0.45, left: '30%' }} />
            </>
          )}
        </div>

        {/* ── Central Sparkle Star ── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: sizeMap.star,
            height: sizeMap.star,
            transform: 'translate(-50%, -50%)',
            // 5-point star via clip-path
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            background: colors.primary,
            filter: `drop-shadow(0 0 ${size === 'sm' ? 6 : 30}px ${colors.glow})`,
            animation: 'sparkle-hyper-pulse 0.8s ease-in-out infinite alternate',
            zIndex: 20,
          }}
        />
      </div>
    </div>
  )
}

// Helper: glowing orbital node dot
function OrbNode({ size, color, style }: { size: number; color: string; style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size * 1.5}px ${color}, 0 0 ${size * 3}px ${color}, 0 0 ${size * 5}px ${color}`,
        ...style,
      }}
    />
  )
}
