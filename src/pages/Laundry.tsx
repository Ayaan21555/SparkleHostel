import React, { useState, useMemo, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { motion } from 'framer-motion'
import { useLaundryOrders, useCreateLaundryOrder } from '@/hooks/useLaundry'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { 
  ShoppingBag, History, CreditCard, Package, 
  Loader2, Plus, Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { LaundryItem } from '@/lib/supabase'

// Types
interface LaundryItemConfig {
  id: string
  name: string
  price: number
  icon: string
}

const LAUNDRY_ITEMS: LaundryItemConfig[] = [
  { id: 'shirt', name: 'Shirt / T-Shirt / Kurta / Top', price: 15, icon: '👕' },
  { id: 'pant', name: 'Pant / Leggings', price: 15, icon: '👖' },
  { id: 'jeans', name: 'Jeans / Saree + Blouse', price: 20, icon: '🧵' },
  { id: 'bedsheet', name: 'Bedsheet + Pillow Cover', price: 25, icon: '🛏️' },
  { id: 'blanket', name: 'Blanket', price: 40, icon: '🧥' },
  { id: 'towel', name: 'Bath Towel', price: 40, icon: '🏖️' },
]

export default function Laundry() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const { orders, isLoading } = useLaundryOrders()
  const createOrder = useCreateLaundryOrder()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, authLoading, navigate])

  const totalPrice = useMemo(() => {
    return (Object.entries(cart) as [string, number][]).reduce((sum, [id, qty]) => {
      const item = LAUNDRY_ITEMS.find(i => i.id === id)
      return sum + (item ? item.price * qty : 0)
    }, 0)
  }, [cart])

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-serif italic">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) return null

  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const removeFromCart = (id: string) => setCart(prev => {
    const next = { ...prev }
    if ((next[id] || 0) > 1) next[id]--
    else delete next[id]
    return next
  })

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order')
      return
    }
    if (Object.keys(cart).length === 0) {
      toast.error('Add items to your cart first')
      return
    }
    try {
      const items: LaundryItem[] = (Object.entries(cart) as [string, number][]).map(([id, qty]) => {
        const item = LAUNDRY_ITEMS.find(i => i.id === id)!
        return { name: item.name, quantity: qty, price: item.price }
      })
      await createOrder.mutateAsync({ items, totalPrice })
      setCart({})
      toast.success('Order placed! Awaiting warden approval.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      ready: 'bg-green-500/10 text-green-600 border-green-500/20',
      delivered: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    }
    return colors[status] || colors.pending
  }

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      unpaid: 'bg-red-500/10 text-red-600 border-red-500/20',
      pending_approval: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      approved: 'bg-green-500/10 text-green-600 border-green-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
    }
    return colors[status] || colors.unpaid
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Laundry Service" 
          subtitle="Place laundry orders and track their status. Prices are transparent and payment is approved by the warden."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="glass border-none shadow-elegant">
              <CardHeader>
                <CardTitle className="font-serif italic text-2xl flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  New Order
                </CardTitle>
                <CardDescription>Select items and quantities for your laundry order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {LAUNDRY_ITEMS.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">₹{item.price} per piece</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(cart[item.id] || 0) > 0 && (
                        <>
                          <Button size="icon" variant="outline" className="w-8 h-8 rounded-full" onClick={() => removeFromCart(item.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-bold text-primary">{cart[item.id]}</span>
                        </>
                      )}
                      <Button size="icon" variant={cart[item.id] ? 'default' : 'outline'} className="w-8 h-8 rounded-full" onClick={() => addToCart(item.id)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {totalPrice > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-primary font-mono">₹{totalPrice}</span>
                    </div>
                    <Button 
                      className="w-full h-12 shadow-glow hover:scale-[1.02] transition-transform" 
                      onClick={handlePlaceOrder}
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <><CreditCard className="w-5 h-5 mr-2" /> Place Order & Request Payment</>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-bold font-serif italic flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> My Orders
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : orders.length === 0 ? (
              <Card className="glass border-none p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No orders yet. Place your first order!</p>
              </Card>
            ) : (
              orders.map(order => (
                <motion.div key={order.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Card className="glass border-none hover:shadow-elegant transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs text-muted-foreground">#{order.id.substring(0, 8)}</span>
                        <div className="flex gap-1">
                          <Badge className={`text-xs rounded-full border ${getStatusColor(order.status)}`}>{order.status}</Badge>
                          <Badge className={`text-xs rounded-full border ${getPaymentColor(order.payment_status)}`}>{order.payment_status}</Badge>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        {(order.items_json as any[]).map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="font-bold text-primary font-mono">₹{order.total_price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
