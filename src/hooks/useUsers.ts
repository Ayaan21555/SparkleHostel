import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, DBUser } from '@/lib/supabase'
import { useAuth } from './useAuth'

// Alias for backward compatibility
export function useCurrentUser() {
  const { user } = useAuth()
  return useUser(user?.id)
}

export function useUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data as DBUser[]
    },
  })
  return { users: data ?? [], isLoading }
}

export function useUser(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data as DBUser
    },
    enabled: !!userId,
  })
  return { user: data, isLoading }
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: Partial<DBUser>) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['users', data.id] })
      qc.invalidateQueries({ queryKey: ['auth-user'] })
    },
  })
}

export function useUploadStudents() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (csvContent: string) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const res = await fetch(
        `${supabaseUrl}/functions/v1/process-student-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({ content: csvContent, fileType: 'csv' }),
        }
      )

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Upload failed')
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function isWarden(user: DBUser | null | undefined): boolean {
  return user?.role === 'warden'
}

export function generateStudentCSVTemplate(): string {
  return 'name,email,room_number,semester\nStudent Name,student@hostel.edu,B-01,3rd\n'
}
