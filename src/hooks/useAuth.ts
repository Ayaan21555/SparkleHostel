import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, DBUser } from '@/lib/supabase'

interface AuthState {
  user: DBUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isWarden: boolean
}

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [sessionUser, setSessionUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const qc = useQueryClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const { data: dbUser, isLoading: dbLoading } = useQuery({
    queryKey: ['auth-user', sessionUser?.email],
    queryFn: async () => {
      if (!sessionUser?.email) return null
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', sessionUser.email)
        .single()
      return data as DBUser | null
    },
    enabled: !!sessionUser?.email,
    staleTime: 60_000,
  })

  const signOut = async () => {
    await supabase.auth.signOut()
    qc.invalidateQueries({ queryKey: ['auth-user'] })
  }

  const isAuthenticated = !!sessionUser && !authLoading
  const isWardenUser = dbUser?.role === 'warden'

  return {
    user: dbUser ?? null,
    isAuthenticated,
    isLoading: authLoading || (isAuthenticated && dbLoading),
    isWarden: isWardenUser,
    signOut,
  }
}
