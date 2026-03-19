import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, DBLaundryOrder, LaundryItem } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useLaundryOrders() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['laundry', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('laundry_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as DBLaundryOrder[]
    },
    enabled: !!user,
  })
  return { orders: data ?? [], isLoading }
}

export function usePendingOrders() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['laundry', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laundry_orders')
        .select('*, users(name, room_number, email)')
        .in('payment_status', ['pending_approval', 'unpaid'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
  return { orders: data ?? [], isLoading }
}

export function useCreateLaundryOrder() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ items, totalPrice }: { items: LaundryItem[]; totalPrice: number }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('laundry_orders')
        .insert({
          user_id: user.id,
          items_json: items,
          total_price: totalPrice,
          status: 'pending',
          payment_status: 'pending_approval',
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laundry'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      paymentStatus,
    }: {
      orderId: string
      status?: string
      paymentStatus?: string
    }) => {
      const updates: Record<string, string> = { updated_at: new Date().toISOString() }
      if (status) updates.status = status
      if (paymentStatus) updates.payment_status = paymentStatus

      const { data, error } = await supabase
        .from('laundry_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laundry'] })
    },
  })
}
