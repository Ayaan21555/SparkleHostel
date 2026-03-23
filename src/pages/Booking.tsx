import React, { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { AnimatedStone } from '@/components/AnimatedStone'
import { motion } from 'framer-motion'
import { useSlotsByDate, useBookSlot } from '@/hooks/useSlots'
import { useAuth } from '@/hooks/useAuth'
import { useCreateUrgentRequest } from '@/hooks/useUrgentRequests'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { format, addMinutes, startOfDay, addDays } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Timer, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [urgentMessage, setUrgentMessage] = useState('')
  const navigate = useNavigate()
  
  const formattedDate = format(selectedDate, 'yyyy-MM-dd')
  const { slots, isLoading } = useSlotsByDate(formattedDate)
  const bookSlotMutation = useBookSlot()
  const createUrgentRequest = useCreateUrgentRequest()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, authLoading, navigate])

  const generateTimeSlots = useMemo(() => {
    const times: string[] = []
    let current = startOfDay(new Date())
    current = addMinutes(current, 8 * 60) // Start at 8 AM
    const end = addMinutes(current, 14 * 60) // End at 10 PM
    
    while (current <= end) {
      times.push(format(current, 'HH:mm'))
      current = addMinutes(current, 30)
    }
    return times
  }, [])

  const handleBook = async (time: string, stoneId: number) => {
    if (!user) {
      toast.error('Please login to book a slot')
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      toast.error('Session expired')
      return
    }

    const userAlreadyBookedToday = slots.some(s => s.user_id === user.id && s.status === 'booked')
    if (userAlreadyBookedToday) {
      toast.error('You can only book 1 active slot per day.')
      return
    }

    const existingSlot = slots.find(s => s.start_time === time && s.stone_id === stoneId)
    
    try {
      if (existingSlot) {
        if (existingSlot.status === 'available') {
          await bookSlotMutation.mutateAsync({ slotId: existingSlot.id })
          toast.success('Slot booked successfully!')
        } else if (existingSlot.status === 'booked') {
          toast.error('This slot is already booked.')
        }
      } else {
        toast.error('This slot is currently unavailable for direct booking.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to book slot')
    }
  }

  const handleUrgentRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!urgentMessage.trim()) {
      toast.error('Please enter a message')
      return
    }
    try {
      await createUrgentRequest.mutateAsync({ message: urgentMessage })
      setUrgentMessage('')
      toast.success('Urgent request sent to warden!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send request')
    }
  }

  const getSlotStatus = (time: string, stoneId: number) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const selectedStr = format(selectedDate, 'yyyy-MM-dd')
    
    if (selectedStr < todayStr) return 'expired'
    
    if (todayStr === selectedStr) {
      const [hours, minutes] = time.split(':').map(Number)
      const slotTime = new Date()
      slotTime.setHours(hours, minutes, 0, 0)
      if (slotTime <= new Date()) {
        return 'expired'
      }
    }

    const slot = slots.find(s => s.start_time === time && s.stone_id === stoneId)
    if (!slot) return 'available'
    return slot.status
  }

  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-serif italic">Loading...</p>
          </div>
        </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Slot Booking" 
          subtitle="Reserve your washing machine slot. Each slot is 30 minutes. Up to 4 machines available." 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Card className="glass overflow-hidden border-none">
              <CardContent className="p-4 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  disabled={selectedDate <= startOfDay(new Date())}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold font-serif italic">
                    {format(selectedDate, 'EEEE, MMMM do')}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            <div className="relative overflow-x-auto rounded-2xl glass p-4 md:p-8 border-none">
              {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground animate-pulse">Scanning available time crystals...</p>
                </div>
              ) : (
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-5 gap-4 mb-6 sticky top-0 bg-background/50 backdrop-blur-sm py-2 z-10">
                    <div className="text-center font-mono text-sm uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" /> Time
                    </div>
                    {[1, 2, 3, 4].map(id => (
                      <div key={id} className="text-center font-mono text-sm uppercase tracking-widest text-muted-foreground">
                        Machine 0{id}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {generateTimeSlots.map((time) => (
                      <motion.div 
                        key={time} 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-5 gap-4"
                      >
                        <div className="flex items-center justify-center font-mono font-bold text-foreground/80">
                          {time}
                        </div>
                        {[1, 2, 3, 4].map(stoneNum => {
                          const status = getSlotStatus(time, stoneNum)
                          const isBookedByMe = slots.find(s => s.start_time === time && s.stone_id === stoneNum && s.user_id === user?.id)
                          
                          return (
                            <motion.button
                              key={stoneNum}
                              whileHover={status === 'expired' ? {} : { scale: 1.02, y: -2 }}
                              whileTap={status === 'expired' ? {} : { scale: 0.98 }}
                              onClick={() => { if(status !== 'expired') handleBook(time, stoneNum) }}
                              disabled={status === 'expired'}
                              className={`
                                relative p-4 rounded-xl border transition-all duration-300 group
                                ${status === 'available' ? 'bg-secondary/20 border-primary/10 hover:border-primary/40' : ''}
                                ${status === 'booked' ? (isBookedByMe ? 'bg-primary/20 border-primary shadow-glow' : 'bg-destructive/10 border-destructive/20 cursor-not-allowed') : ''}
                                ${status === 'waiting' ? 'bg-accent/20 border-accent/40' : ''}
                                ${status === 'expired' ? 'bg-muted/10 border-muted/20 cursor-not-allowed opacity-50' : ''}
                              `}
                            >
                              <div className="flex flex-col items-center gap-1">
                                {status === 'available' && <PlusCircle className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />}
                                {status === 'booked' && (isBookedByMe ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Timer className="w-5 h-5 text-destructive/40" />)}
                                {status === 'waiting' && <Users className="w-5 h-5 text-accent" />}
                                {status === 'expired' && <Clock className="w-5 h-5 text-muted-foreground/30" />}
                                
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${status === 'available' ? 'text-primary/60' : status === 'expired' ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                                  {status}
                                </span>
                              </div>
                            </motion.button>
                          )
                        })}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">


            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass border-none shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" /> Urgent Request
                  </CardTitle>
                  <CardDescription>
                    Can't find a slot? Send an urgent request to the warden.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUrgentRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Reason / Message</Label>
                      <Textarea 
                        id="message"
                        placeholder="Explain why you need an urgent slot..."
                        value={urgentMessage}
                        onChange={(e) => setUrgentMessage(e.target.value)}
                        className="bg-background/50 border-primary/10 focus:border-primary/40 min-h-[100px]"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full shadow-glow" 
                      disabled={createUrgentRequest.isPending || !urgentMessage.trim()}
                    >
                      {createUrgentRequest.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Send Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="glass border-none">
              <CardContent className="p-6">
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Live Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Available</span>
                    <span className="font-bold text-primary">{generateTimeSlots.length * 4 - slots.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><Timer className="w-4 h-4" /> Booked</span>
                    <span className="font-bold text-destructive">{slots.filter(s => s.status === 'booked').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" /> Waiting</span>
                    <span className="font-bold text-accent">{slots.filter(s => s.status === 'waiting').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
