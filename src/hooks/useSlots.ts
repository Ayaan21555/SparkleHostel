import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, DBSlot } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useSlots() {
  const { data: slots, isLoading, error } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      if (error) throw error
      return data as DBSlot[]
    },
    staleTime: 30_000,
  })
  return { slots: slots ?? [], isLoading, error }
}

export function useSlotsByDate(date: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['slots', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .eq('date', date)
        .order('start_time', { ascending: true })
      if (error) throw error
      return data as DBSlot[]
    },
    enabled: !!date,
    staleTime: 15_000,
  })
  return { slots: data ?? [], isLoading }
}

export function useBookSlot() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ slotId }: { slotId: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('slots')
        .update({ user_id: user.id, status: 'booked', updated_at: new Date().toISOString() })
        .eq('id', slotId)
        .eq('status', 'available')
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

export function useCancelSlot() {
  const qc = useQueryClient()
  const { user, isWarden } = useAuth()

  return useMutation({
    mutationFn: async ({ slotId }: { slotId: string }) => {
      if (!user) throw new Error('Not authenticated')
      
      let query = supabase
        .from('slots')
        .update({ user_id: null, status: 'available', updated_at: new Date().toISOString() })
        .eq('id', slotId)
      
      if (!isWarden) {
        query = query.eq('user_id', user.id)
      }
      
      const { data, error } = await query.select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

export function useCreateSlots() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (slots: Omit<DBSlot, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase.from('slots').insert(slots).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}
