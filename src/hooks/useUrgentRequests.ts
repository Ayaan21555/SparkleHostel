import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, DBUrgentRequest } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useUrgentRequests() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['urgent', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('urgent_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as DBUrgentRequest[]
    },
    enabled: !!user,
  })
  return { requests: data ?? [], isLoading }
}

export function useOpenRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ['urgent', 'open'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('urgent_requests')
        .select('*, users(name, room_number)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
  return { requests: data ?? [], isLoading }
}

export function useCreateUrgentRequest() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ message, slotId }: { message: string; slotId?: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('urgent_requests')
        .insert({
          user_id: user.id,
          message,
          slot_id: slotId ?? null,
          status: 'open',
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['urgent'] })
    },
  })
}

export function useResolveRequest() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'resolved' | 'dismissed' }) => {
      const { data, error } = await supabase
        .from('urgent_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['urgent'] })
    },
  })
}
