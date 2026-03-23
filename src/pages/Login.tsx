import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { LogIn, ShieldCheck, User, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { useNavigate } from '@tanstack/react-router'
import { SparkleOrbitLogo } from '../components/SparkleOrbitLogo'

export default function Login() {
  const [role, setRole] = useState<'student' | 'warden'>('student')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/profile' })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
      toast.error(`Too many failed attempts. Try again in ${remaining}s.`)
      return
    }

    if (!name.trim() || !password.trim()) {
      toast.error('Please enter your name and password')
      return
    }

    setIsLoading(true)
    try {
      // Step 1: Look up the user's email by name + role in the users table
      const { data: userRecord, error: lookupError } = await supabase
        .from('users')
        .select('email, name, role')
        .ilike('name', name.trim())   // case-insensitive match
        .eq('role', role)
        .single()

      if (lookupError || !userRecord) {
        throw new Error('No account found with that name. Ask your warden to register you.')
      }

      // Step 2: Sign in with the found email + provided password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password,
      })

      if (signInError) throw new Error('Incorrect password. Use the default password if you have not changed it.')

      setLoginAttempts(0)
      setLockoutUntil(null)
      toast.success(`Welcome, ${userRecord.name}! 👋`)
      navigate({ to: '/profile' })
    } catch (error: any) {
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 2 * 60 * 1000)
        setLoginAttempts(0)
        toast.error('Too many failed attempts. Locked for 2 minutes.')
      } else {
        toast.error(error?.message || 'Login failed.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-[80vh] flex items-center justify-center p-6 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[600px] rounded-full blur-[120px] bg-primary/8"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-1/4 right-1/4 -z-10 w-[300px] h-[300px] rounded-full blur-[80px] bg-accent/10"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <Card className="glass relative overflow-hidden border-primary/20 shadow-glow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

            <CardHeader className="text-center pt-8 pb-4">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <SparkleOrbitLogo size="sm" showStreaks={false} />
              </div>

              {/* Role switcher */}
              <div className="flex justify-center gap-3 mb-4">
                {(['student', 'warden'] as const).map(r => (
                  <motion.button
                    key={r}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                      role === r
                        ? 'bg-primary text-primary-foreground shadow-glow scale-105'
                        : 'glass border border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r === 'student' ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {r === 'student' ? 'Student' : 'Warden'}
                  </motion.button>
                ))}
              </div>

              <CardTitle className="text-4xl font-serif italic font-bold tracking-tight">
                {role === 'student' ? 'Student Portal' : 'Warden Admin'}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {role === 'student'
                  ? 'Enter your name and the hostel password to sign in'
                  : 'Enter your warden name and password'}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-8 pb-4">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {role === 'student' ? 'Your Full Name' : 'Warden Name'}
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={role === 'warden' ? 'e.g. Warden Priya' : 'e.g. Suhada'}
                      className="h-12 pl-11 border-border/40 focus:border-primary bg-background/50 transition-all"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      className="h-12 pr-11 border-border/40 focus:border-primary bg-background/50 transition-all"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold shadow-glow group hover:scale-[1.02] transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign In <LogIn className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Info box */}
              <div className="mt-5 p-4 rounded-xl border border-border/30 bg-muted/30 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">How to login:</p>
                <p>• Enter your <span className="text-primary font-medium">exact name</span> as registered by the warden</p>
                <p>• Default password for all students: <code className="bg-background px-1.5 py-0.5 rounded font-mono">Hostel@2024</code></p>
                <p>• Default password for warden: <code className="bg-background px-1.5 py-0.5 rounded font-mono">Hostel@2024</code></p>
                <p>• You can change your password from your Profile page after logging in</p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-8 pb-8 pt-0">
              {role === 'warden' && (
                <Badge variant="destructive" className="mx-auto rounded-full py-1 animate-pulse">
                  WARDEN ACCESS — AUTHORIZED PERSONNEL ONLY
                </Badge>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
