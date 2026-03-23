import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile } from '@/hooks/useUsers'
import { supabase } from '@/lib/supabase'
import {
  User as UserIcon,
  Mail,
  Hash,
  Building2,
  GraduationCap,
  Loader2,
  CheckCircle2,
  LogOut,
  ShoppingBag,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Camera,
  MessageSquare,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'
export default function Profile() {
  const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth()
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const picInputRef = useRef<HTMLInputElement>(null)
  const [picUploading, setPicUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '', room_number: '', branch: '', semester: '',
  })

  const [pwData, setPwData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(5)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) { toast.error('Please write something'); return; }
    setFeedbackLoading(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user!.id,
        message: feedback,
        rating,
      })
      if (error) throw error
      toast.success('Thank you for your feedback!')
      setFeedback('')
      setRating(5)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback')
    } finally {
      setFeedbackLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate({ to: '/login' })
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        room_number: user.room_number || '',
        branch: user.branch || '',
        semester: user.semester || '',
      })
    }
  }, [user?.id])

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync(formData)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwData.newPassword || !pwData.confirmPassword) {
      toast.error('Please fill in all password fields'); return
    }
    if (pwData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters'); return
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    setPwLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData.session?.user?.email
      if (!email) throw new Error('Session expired. Please log in again.')
      const { error: reAuthError } = await supabase.auth.signInWithPassword({ email, password: pwData.currentPassword })
      if (reAuthError) throw new Error('Current password is incorrect')
      const { error: updateError } = await supabase.auth.updateUser({ password: pwData.newPassword })
      if (updateError) throw updateError
      await supabase.from('users').update({ password_changed: true, updated_at: new Date().toISOString() }).eq('id', user!.id)
      toast.success('Password changed successfully! 🎉')
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
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

  if (!user) return null

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader title="My Profile" subtitle="Manage your account settings and personal information." />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Sidebar */}
          <Card className="md:col-span-4 border-none glass overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20" />
            <CardContent className="relative pt-0 pb-8 text-center">
              <div className="flex justify-center -mt-16 mb-4">
                <div className="relative group cursor-pointer" onClick={() => picInputRef.current?.click()}>
                  <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                    <AvatarImage src={user.profile_pic || ''} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {picUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <input ref={picInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicUpload} />
              </div>
              <h2 className="text-2xl font-serif italic font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-widest border border-primary/20">
                  {user.role}
                </div>
                {user.room_number && (
                  <div className="px-3 py-1 bg-secondary/30 text-secondary-foreground text-xs font-bold rounded-full border border-border">
                    Room {user.room_number}
                  </div>
                )}
              </div>
              {!user.password_changed && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs text-left">
                  ⚠️ You are using the default password. Please change it below.
                </div>
              )}
              <Button variant="outline" className="w-full mt-6 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card className="md:col-span-8 border-none glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-primary" /> Personal Information</CardTitle>
              <CardDescription>Keep your details up to date</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Full Name</Label>
                    <Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Hash className="w-4 h-4" /> Room Number</Label>
                    <Input value={formData.room_number || ''} onChange={e => setFormData(prev => ({ ...prev, room_number: e.target.value }))} className="bg-background/50" placeholder="e.g. B-102" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Branch</Label>
                    <Input value={formData.branch || ''} onChange={e => setFormData(prev => ({ ...prev, branch: e.target.value }))} className="bg-background/50" placeholder="e.g. CSE" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Semester</Label>
                    <Input value={formData.semester || ''} onChange={e => setFormData(prev => ({ ...prev, semester: e.target.value }))} className="bg-background/50" placeholder="e.g. 6th" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" className="w-full md:w-auto min-w-[200px] shadow-glow" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="md:col-span-12 border-none glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
              <CardDescription>Update your password. Use at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Lock className="w-4 h-4" /> Current Password</Label>
                  <div className="relative">
                    <Input type={showCurrent ? 'text' : 'password'} placeholder="Current password" className="bg-background/50 pr-10" value={pwData.currentPassword} onChange={e => setPwData(prev => ({ ...prev, currentPassword: e.target.value }))} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrent(v => !v)}>
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> New Password</Label>
                  <div className="relative">
                    <Input type={showNew ? 'text' : 'password'} placeholder="Min 8 characters" className="bg-background/50 pr-10" value={pwData.newPassword} onChange={e => setPwData(prev => ({ ...prev, newPassword: e.target.value }))} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNew(v => !v)}>
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> Confirm Password</Label>
                  <div className="relative">
                    <Input type={showConfirm ? 'text' : 'password'} placeholder="Repeat new password"
                      className={`bg-background/50 pr-10 ${pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword ? 'border-destructive' : ''}`}
                      value={pwData.confirmPassword} onChange={e => setPwData(prev => ({ ...prev, confirmPassword: e.target.value }))} required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>
                <div className="md:col-span-3 pt-2 border-t border-border/50">
                  <Button type="submit" disabled={pwLoading} className="min-w-[200px] shadow-glow">
                    {pwLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Submit Feedback */}
          <Card className="md:col-span-12 border-none glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Submit Review & Feedback</CardTitle>
              <CardDescription>Share your experience or report issues directly to the warden.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-6 h-6 cursor-pointer hover:scale-110 transition-transform ${star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
                <Textarea 
                  placeholder="Tell us what you love or what needs improvement..." 
                  className="bg-background/50 border-primary/10 focus:border-primary/40 min-h-[100px]"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <Button type="submit" disabled={feedbackLoading || !feedback.trim()} className="shadow-glow min-w-[150px]">
                  {feedbackLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}