import React, { useEffect, useRef } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { useSlots, useSlotsByDate, useBookSlot, useCancelSlot, useCreateSlots } from '@/hooks/useSlots'
import { useUsers, useUploadStudents } from '@/hooks/useUsers'
import { usePendingOrders, useUpdateOrderStatus } from '@/hooks/useLaundry'
import { useOpenRequests, useResolveRequest } from '@/hooks/useUrgentRequests'
import { useAuth } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useNavigate } from '@tanstack/react-router'
import { format, addDays } from 'date-fns'
import {
  Users, Calendar, ShoppingBag, Zap,
  CheckCircle2, XCircle, Clock, Loader2,
  UserPlus, Trash2, PackageCheck, Truck,
  MessageSquare, Camera, MoreVertical,
  ChevronLeft, ChevronRight, WashingMachine
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'
import { Label } from '@/components/ui/label'

export default function WardenDashboard() {
  const { user, isAuthenticated, isWarden, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { slots, isLoading: isLoadingSlots } = useSlots()
  const { users, isLoading: isLoadingUsers } = useUsers()
  const { orders, isLoading: isLoadingOrders } = usePendingOrders()
  const { requests, isLoading: isLoadingRequests } = useOpenRequests()
  const cancelSlot = useCancelSlot()
  const updateOrder = useUpdateOrderStatus()
  const resolveRequest = useResolveRequest()
  const uploadStudents = useUploadStudents()
  const queryClient = useQueryClient()
  const picInputRef = useRef<HTMLInputElement>(null)

  // ── Student form state ──
  const [studentForm, setStudentForm] = React.useState({ name: '', email: '', room_number: '', branch: '', semester: '' })
  const [editingStudent, setEditingStudent] = React.useState<string | null>(null)
  const [studentSubmitting, setStudentSubmitting] = React.useState(false)

  // ── Book-for-student state ──
  const [bookDate, setBookDate] = React.useState(new Date())
  const formattedBookDate = format(bookDate, 'yyyy-MM-dd')
  const { slots: dateSlots, isLoading: isLoadingDateSlots } = useSlotsByDate(formattedBookDate)
  const bookSlot = useBookSlot()
  const [selectedStudent, setSelectedStudent] = React.useState('')
  const [bookingFor, setBookingFor] = React.useState<{ slotId: string; time: string; machine: number } | null>(null)
  const [bookingLoading, setBookingLoading] = React.useState(false)

  // ── Profile pic state ──
  const [picUploading, setPicUploading] = React.useState(false)

  // ── Feedback state ──
  const [feedbacks, setFeedbacks] = React.useState<any[]>([])
  const [feedbacksLoading, setFeedbacksLoading] = React.useState(false)
  const [replyText, setReplyText] = React.useState<Record<string, string>>({})
  const [replyLoading, setReplyLoading] = React.useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isWarden)) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isWarden, authLoading, navigate])

  useEffect(() => {
    if (isAuthenticated && isWarden) {
      loadFeedbacks()
    }
  }, [isAuthenticated, isWarden])

  const loadFeedbacks = async () => {
    setFeedbacksLoading(true)
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, users(name, room_number, profile_pic)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setFeedbacks(data || [])
    } catch (err: any) {
      toast.error('Could not load feedback')
    } finally {
      setFeedbacksLoading(false)
    }
  }

  // ── Profile pic upload ──
  const handlePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }

    setPicUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: dbErr } = await supabase
        .from('users').update({ profile_pic: urlData.publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (dbErr) throw dbErr
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      toast.success('Profile picture updated!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setPicUploading(false)
    }
  }

  // ── Order actions ──
  const handleUpdateOrder = async (orderId: string, status?: string, paymentStatus?: string) => {
    try {
      await updateOrder.mutateAsync({ orderId, status, paymentStatus })
      toast.success('Order updated')
    } catch (err: any) { toast.error(err.message || 'Failed') }
  }

  const handleResolveRequest = async (requestId: string, status: 'resolved' | 'dismissed') => {
    try {
      await resolveRequest.mutateAsync({ requestId, status })
      toast.success(`Request ${status}`)
    } catch (err: any) { toast.error(err.message || 'Failed') }
  }

  // ── Student CRUD ──
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name.trim() || !studentForm.email.trim()) { toast.error('Name and email required'); return }
    setStudentSubmitting(true)
    try {
      if (editingStudent) {
        const { error } = await supabase.from('users').update({
          name: studentForm.name.trim(), email: studentForm.email.trim().toLowerCase(),
          room_number: studentForm.room_number || null, branch: studentForm.branch || null,
          semester: studentForm.semester || null, updated_at: new Date().toISOString(),
        }).eq('id', editingStudent)
        if (error) throw error
        toast.success('Student updated!')
        setEditingStudent(null)
      } else {
        // Use edge function to properly create auth account + profile together
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        if (!token) throw new Error('Session expired. Please log in again.')

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const res = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: studentForm.name.trim(),
            email: studentForm.email.trim().toLowerCase(),
            room_number: studentForm.room_number || null,
            branch: studentForm.branch || null,
            semester: studentForm.semester || null,
          }),
        })

        const result = await res.json()
        if (!res.ok || result.error) throw new Error(result.error || 'Failed to create student')
        toast.success(`"${studentForm.name}" added! Login: name + Hostel@2024`)
      }
      setStudentForm({ name: '', email: '', room_number: '', branch: '', semester: '' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) { toast.error(err.message || 'Failed') }
    finally { setStudentSubmitting(false) }
  }

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Remove ${studentName}? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('users').delete().eq('id', studentId)
      if (error) throw error
      toast.success(`${studentName} removed`)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (err: any) { toast.error(err.message || 'Failed') }
  }

  const handleUploadStudents = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.csv'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]; if (!file) return
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const content = ev.target?.result as string
        try {
          toast.loading('Importing...', { id: 'upload' })
          await uploadStudents.mutateAsync(content)
          toast.success('Students imported!', { id: 'upload' })
          queryClient.invalidateQueries({ queryKey: ['users'] })
        } catch (err: any) { toast.error(err.message || 'Failed', { id: 'upload' }) }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // ── Book slot for a student ──
  const handleBookForStudent = async () => {
    if (!bookingFor || !selectedStudent) { toast.error('Select a student and slot'); return }
    setBookingLoading(true)
    try {
      const { error } = await supabase.from('slots').update({
        user_id: selectedStudent, status: 'booked', updated_at: new Date().toISOString()
      }).eq('id', bookingFor.slotId).eq('status', 'available')
      if (error) throw error
      toast.success('Slot booked for student!')
      setBookingFor(null)
      setSelectedStudent('')
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    } catch (err: any) { toast.error(err.message || 'Failed to book') }
    finally { setBookingLoading(false) }
  }

  // ── Reply to feedback ──
  const handleReply = async (feedbackId: string) => {
    const text = replyText[feedbackId]?.trim()
    if (!text) { toast.error('Enter a reply'); return }
    setReplyLoading(feedbackId)
    try {
      const { error } = await supabase.from('feedback')
        .update({ warden_reply: text, replied_at: new Date().toISOString() }).eq('id', feedbackId)
      if (error) throw error
      toast.success('Reply sent!')
      setReplyText(prev => ({ ...prev, [feedbackId]: '' }))
      loadFeedbacks()
    } catch (err: any) { toast.error(err.message || 'Failed') }
    finally { setReplyLoading(null) }
  }

  const getSlotStatus = (time: string, machine: number) => {
    const slot = dateSlots.find(s => s.start_time === time && s.stone_id === machine)
    if (!slot) return 'unavailable'
    return slot.status
  }

  const getSlotId = (time: string, machine: number) => {
    return dateSlots.find(s => s.start_time === time && s.stone_id === machine)?.id
  }

  const times = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
    '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
    '18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00']

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-serif italic">Verifying access...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated || !isWarden) return null

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">

        {/* ── Warden Profile Header ── */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 p-6 glass rounded-2xl border border-border/40">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-primary/30 shadow-glow">
              <AvatarImage src={user?.profile_pic || ''} />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {user?.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => picInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {picUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
            </button>
            <input ref={picInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload} />
          </div>
          <div>
            <h1 className="text-3xl font-serif italic font-bold">{user?.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px]">Warden</Badge>
          </div>
          <div className="md:ml-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Students', value: users.filter(u => u.role === 'student').length },
              { label: 'Active Slots', value: slots.filter(s => s.status === 'booked').length },
              { label: 'Pending Orders', value: orders.length },
              { label: 'Open Requests', value: requests.length },
            ].map(stat => (
              <div key={stat.label} className="p-3 bg-background/50 rounded-xl border border-border/40">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Warden Analytics (Recharts) ── */}
        <div className="mb-10">
          <Card className="glass border-none shadow-elegant overflow-hidden">
            <CardHeader className="bg-black/20 border-b border-white/5">
              <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Global Hostel Activity</CardTitle>
              <CardDescription>Real-time machine utilization across all time slots.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'].map(h => ({
                    time: `${h}:00`,
                    'Active Bookings': slots.filter(s => s.start_time.startsWith(h) && s.status === 'booked').length
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="Active Bookings" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary/80 hover:fill-primary transition-colors" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList className="bg-background/50 border border-border/50 p-1 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="bookings" className="gap-2"><Calendar className="w-4 h-4" /> Slot Bookings</TabsTrigger>
            <TabsTrigger value="book-for-student" className="gap-2"><WashingMachine className="w-4 h-4" /> Book for Student</TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="w-4 h-4" /> Orders</TabsTrigger>
            <TabsTrigger value="requests" className="gap-2"><Zap className="w-4 h-4" /> Urgent</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Feedback
              {feedbacks.filter(f => !f.warden_reply).length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {feedbacks.filter(f => !f.warden_reply).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2"><Users className="w-4 h-4" /> Students</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">

            {/* ── SLOT BOOKINGS TAB ── */}
            <TabsContent value="bookings" className="m-0">
              <Card className="glass border-none">
                <CardHeader>
                  <CardTitle>All Current Bookings</CardTitle>
                  <CardDescription>View and cancel student slot bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSlots ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                  ) : slots.filter(s => s.status === 'booked').length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No active bookings right now.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {slots.filter(s => s.status === 'booked').map(slot => {
                        const student = users.find(u => u.id === slot.user_id)
                        return (
                          <Card key={slot.id} className="bg-background/50 border-border/50 hover:border-primary/30 transition-all">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Clock className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-sm">{slot.start_time}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">{slot.date}</div>
                                  </div>
                                </div>
                                <Button
                                  size="sm" variant="ghost"
                                  className="h-7 px-2 text-destructive hover:bg-destructive/10"
                                  onClick={async () => {
                                    try {
                                      await cancelSlot.mutateAsync({ slotId: slot.id })
                                      toast.success('Booking cancelled')
                                    } catch (e: any) { toast.error(e.message) }
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{student?.name || 'Unknown'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Room</span><span>{student?.room_number || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Machine</span><span className="font-mono text-primary font-bold">#{slot.stone_id}</span></div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── BOOK FOR STUDENT TAB ── */}
            <TabsContent value="book-for-student" className="m-0 space-y-6">
              <Card className="glass border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><WashingMachine className="w-5 h-5 text-primary" /> Book a Slot for a Student</CardTitle>
                  <CardDescription>Select a date, pick an available slot, choose the student, and confirm.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date picker */}
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setBookDate(d => addDays(d, -1))}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-lg font-bold font-serif">{format(bookDate, 'EEEE, dd MMM yyyy')}</div>
                    <Button variant="outline" size="icon" onClick={() => setBookDate(d => addDays(d, 1))}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Student selector */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Select Student</label>
                    <select
                      value={selectedStudent}
                      onChange={e => setSelectedStudent(e.target.value)}
                      className="w-full md:w-64 h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">— Choose student —</option>
                      {users.filter(u => u.role === 'student').map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Room {s.room_number || 'N/A'})</option>
                      ))}
                    </select>
                  </div>

                  {/* Slot grid */}
                  {isLoadingDateSlots ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="text-xs w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="py-2 px-3 text-left text-muted-foreground font-medium">Time</th>
                            {[1,2,3,4].map(m => (
                              <th key={m} className="py-2 px-3 text-center text-muted-foreground font-medium">Machine {m}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {times.map(time => (
                            <tr key={time} className="border-t border-border/20">
                              <td className="py-2 px-3 font-mono text-muted-foreground">{time}</td>
                              {[1,2,3,4].map(machine => {
                                const status = getSlotStatus(time, machine)
                                const slotId = getSlotId(time, machine)
                                const isSelected = bookingFor?.slotId === slotId
                                return (
                                  <td key={machine} className="py-1 px-2 text-center">
                                    <button
                                      disabled={status !== 'available'}
                                      onClick={() => slotId && setBookingFor({ slotId, time, machine })}
                                      className={`w-full rounded-md py-1 px-2 text-[10px] font-bold uppercase transition-all ${
                                        isSelected ? 'bg-primary text-primary-foreground scale-105 shadow-glow' :
                                        status === 'available' ? 'bg-green-500/15 text-green-600 hover:bg-green-500/30 cursor-pointer' :
                                        status === 'booked' ? 'bg-primary/10 text-primary/60 cursor-not-allowed' :
                                        'bg-muted text-muted-foreground cursor-not-allowed'
                                      }`}
                                    >
                                      {isSelected ? '✓ Selected' : status === 'available' ? 'Free' : status === 'booked' ? 'Booked' : '—'}
                                    </button>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Confirm booking */}
                  {bookingFor && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="text-sm">
                        <span className="font-bold text-primary">Selected:</span> Machine #{bookingFor.machine} at <span className="font-mono font-bold">{bookingFor.time}</span>
                        {selectedStudent && (
                          <span> for <span className="font-bold">{users.find(u => u.id === selectedStudent)?.name}</span></span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleBookForStudent} disabled={bookingLoading || !selectedStudent} className="shadow-glow">
                          {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Confirm Booking
                        </Button>
                        <Button variant="outline" onClick={() => setBookingFor(null)}>Cancel</Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── ORDERS TAB ── */}
            <TabsContent value="orders" className="m-0">
              <Card className="glass border-none">
                <CardHeader>
                  <CardTitle>Laundry Orders</CardTitle>
                  <CardDescription>Manage laundry processing and payment approvals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No pending laundry orders.</div>
                  ) : orders.map((order: any) => (
                    <Card key={order.id} className="bg-background/50 border-border/50">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <PackageCheck className="w-5 h-5 text-primary" />
                              <span className="font-bold font-serif italic">Order #{order.id.substring(0, 8)}</span>
                              <Badge variant="outline" className="text-[10px] uppercase">{order.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><Label className="text-muted-foreground text-[10px] uppercase">Student</Label><div className="font-medium">{order.users?.name || 'Unknown'}</div></div>
                              <div><Label className="text-muted-foreground text-[10px] uppercase">Room</Label><div className="text-xs">{order.users?.room_number || 'N/A'}</div></div>
                            </div>
                            <div className="p-3 bg-secondary/20 rounded-lg space-y-1">
                              {order.items_json.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                                  <span>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                              <div className="pt-2 mt-2 border-t border-border/30 flex justify-between font-bold text-primary text-sm">
                                <span>Total</span><span>₹{order.total_price}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[180px]">
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white border-none shadow-none" disabled={order.payment_status === 'approved'} onClick={() => handleUpdateOrder(order.id, undefined, 'approved')}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 text-destructive hover:bg-destructive/10 border-destructive/20" disabled={order.payment_status === 'rejected'} onClick={() => handleUpdateOrder(order.id, undefined, 'rejected')}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button size="sm" variant="outline" className="text-[10px] h-8" onClick={() => handleUpdateOrder(order.id, 'processing')}><Clock className="w-3 h-3 mr-1" /> Washing</Button>
                              <Button size="sm" variant="outline" className="text-[10px] h-8" onClick={() => handleUpdateOrder(order.id, 'ready')}><PackageCheck className="w-3 h-3 mr-1" /> Ready</Button>
                              <Button size="sm" variant="outline" className="text-[10px] h-8" onClick={() => handleUpdateOrder(order.id, 'delivered')}><Truck className="w-3 h-3 mr-1" /> Delivered</Button>
                              <Button size="sm" variant="outline" className="text-[10px] h-8 text-destructive" onClick={() => handleUpdateOrder(order.id, 'cancelled')}><Trash2 className="w-3 h-3 mr-1" /> Cancel</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── URGENT REQUESTS TAB ── */}
            <TabsContent value="requests" className="m-0">
              <Card className="glass border-none">
                <CardHeader>
                  <CardTitle>Urgent Requests</CardTitle>
                  <CardDescription>Review and resolve urgent booking requests from students.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingRequests ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                  ) : requests.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No open urgent requests.</div>
                  ) : requests.map((req: any) => (
                    <Card key={req.id} className="bg-background/50 border-border/50 border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary/10 text-primary border-primary/20"><Zap className="w-3 h-3 mr-1" /> Urgent</Badge>
                              <span className="text-xs text-muted-foreground font-mono">{new Date(req.created_at).toLocaleString()}</span>
                            </div>
                            <div className="font-bold text-sm">{req.users?.name} (Room {req.users?.room_number || 'N/A'})</div>
                            <p className="text-sm bg-background/50 p-3 rounded-lg italic border border-border/50">"{req.message}"</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => handleResolveRequest(req.id, 'resolved')}><CheckCircle2 className="w-4 h-4 mr-1" /> Resolve</Button>
                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleResolveRequest(req.id, 'dismissed')}><XCircle className="w-4 h-4 mr-1" /> Dismiss</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── FEEDBACK TAB ── */}
            <TabsContent value="feedback" className="m-0">
              <Card className="glass border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Student Feedback</CardTitle>
                  <CardDescription>Private reviews and comments from students — only you can see these.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedbacksLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                  ) : feedbacks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No student feedback yet.</p>
                    </div>
                  ) : feedbacks.map((fb: any) => (
                    <Card key={fb.id} className={`bg-background/50 border-border/50 ${!fb.warden_reply ? 'border-l-4 border-l-yellow-500' : ''}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 border border-primary/20">
                            <AvatarImage src={fb.users?.profile_pic || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {fb.users?.name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">{fb.users?.name}</span>
                              <span className="text-xs text-muted-foreground">Room {fb.users?.room_number || 'N/A'}</span>
                              <span className="text-xs text-muted-foreground font-mono ml-auto">{new Date(fb.created_at).toLocaleDateString()}</span>
                              {!fb.warden_reply && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px]">Awaiting Reply</Badge>}
                            </div>
                            {fb.rating && (
                              <div className="flex gap-0.5 mt-1">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={s <= fb.rating ? 'text-primary' : 'text-muted-foreground/30'}>★</span>
                                ))}
                              </div>
                            )}
                            <p className="text-sm mt-2 bg-secondary/20 p-3 rounded-lg italic">"{fb.message}"</p>
                          </div>
                        </div>

                        {/* Warden reply */}
                        {fb.warden_reply ? (
                          <div className="ml-13 pl-4 border-l-2 border-primary/30">
                            <p className="text-xs text-muted-foreground mb-1">Your reply · {new Date(fb.replied_at).toLocaleDateString()}</p>
                            <p className="text-sm">{fb.warden_reply}</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              placeholder="Write a reply..."
                              value={replyText[fb.id] || ''}
                              onChange={e => setReplyText(prev => ({ ...prev, [fb.id]: e.target.value }))}
                              className="flex-1 h-9 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary"
                              onKeyDown={e => e.key === 'Enter' && handleReply(fb.id)}
                            />
                            <Button size="sm" onClick={() => handleReply(fb.id)} disabled={replyLoading === fb.id}>
                              {replyLoading === fb.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reply'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── STUDENTS TAB ── */}
            <TabsContent value="students" className="m-0 space-y-6">
              <Card className="glass border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                  </CardTitle>
                  <CardDescription>
                    {editingStudent ? 'Update student details.' : 'Students log in with their name + default password Hostel@2024'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'Full Name *', key: 'name', placeholder: 'e.g. Priya Sharma', type: 'text', required: true },
                      { label: 'Email *', key: 'email', placeholder: 'student@hostel.edu', type: 'email', required: true },
                      { label: 'Room Number', key: 'room_number', placeholder: 'e.g. A-101', type: 'text', required: false },
                      { label: 'Branch', key: 'branch', placeholder: 'e.g. CSE', type: 'text', required: false },
                      { label: 'Semester', key: 'semester', placeholder: 'e.g. 3rd', type: 'text', required: false },
                    ].map(field => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-sm font-medium">{field.label}</label>
                        <input
                          required={field.required} type={field.type} placeholder={field.placeholder}
                          value={studentForm[field.key as keyof typeof studentForm]}
                          onChange={e => setStudentForm(p => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                    <div className="flex items-end gap-2">
                      <Button type="submit" disabled={studentSubmitting} className="flex-1 shadow-glow">
                        {studentSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {editingStudent ? 'Save Changes' : 'Add Student'}
                      </Button>
                      {editingStudent && (
                        <Button type="button" variant="outline" onClick={() => { setEditingStudent(null); setStudentForm({ name: '', email: '', room_number: '', branch: '', semester: '' }) }}>Cancel</Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass border-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Student Directory</CardTitle>
                    <CardDescription>{users.filter(u => u.role === 'student').length} students registered</CardDescription>
                  </div>
                  <Button onClick={handleUploadStudents} variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/10">
                    <UserPlus className="w-4 h-4" /> Import CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                  ) : users.filter(u => u.role === 'student').length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No students yet.</p></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead><tr className="border-b border-border/50">
                          <th className="py-3 px-4 font-medium text-muted-foreground">Name</th>
                          <th className="py-3 px-4 font-medium text-muted-foreground">Room</th>
                          <th className="py-3 px-4 font-medium text-muted-foreground">Email</th>
                          <th className="py-3 px-4 font-medium text-muted-foreground">Branch/Sem</th>
                          <th className="py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr></thead>
                        <tbody>
                          {users.filter(u => u.role === 'student').map(student => (
                            <tr key={student.id} className="border-b border-border/20 hover:bg-secondary/10 transition-colors">
                              <td className="py-3 px-4 font-bold">{student.name}</td>
                              <td className="py-3 px-4">{student.room_number || '—'}</td>
                              <td className="py-3 px-4 text-muted-foreground text-xs">{student.email}</td>
                              <td className="py-3 px-4">{student.branch || '—'} {student.semester ? `(${student.semester})` : ''}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-primary hover:bg-primary/10"
                                    onClick={() => { setEditingStudent(student.id); setStudentForm({ name: student.name, email: student.email, room_number: student.room_number || '', branch: student.branch || '', semester: student.semester || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStudent(student.id, student.name)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </AnimatePresence>
        </Tabs>
      </div>
    </Layout>
  )
}
