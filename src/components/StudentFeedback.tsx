import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, MessageSquare, Send, Star, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'

export function StudentFeedback() {
  const { user, isAuthenticated } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyFeedbacks()
    }
  }, [isAuthenticated, user?.id])

  const loadMyFeedbacks = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMyFeedbacks(data || [])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast.error('Please log in to leave feedback'); return }
    if (!message.trim()) { toast.error('Please write a message'); return }
    if (rating === 0) { toast.error('Please select a star rating'); return }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        message: message.trim(),
        rating,
      })
      if (error) throw error
      toast.success('Feedback submitted! The warden will review it.')
      setMessage('')
      setRating(0)
      setSubmitted(true)
      loadMyFeedbacks()
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 px-6 py-1 bg-primary/20 text-primary border-primary/20">Private Feedback</Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 italic font-serif">
            Share Your <span className="text-primary">Thoughts</span>
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg italic">
            Your feedback goes directly to the warden. It's completely private — other students cannot see it.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
            <Lock className="w-3.5 h-3.5" /> Only visible to the warden
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Write Feedback */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="glass border-primary/20">
              <CardContent className="p-8">
                {!isAuthenticated ? (
                  <div className="text-center py-8 space-y-4">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground">Please <a href="/login" className="text-primary font-semibold hover:underline">log in</a> to leave feedback.</p>
                  </div>
                ) : submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                      <span className="text-4xl">✓</span>
                    </div>
                    <p className="font-bold text-lg text-green-600">Feedback Sent!</p>
                    <p className="text-muted-foreground text-sm">The warden will review your message.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <p className="text-sm font-medium mb-2">Rate your experience</p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star} type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="text-3xl transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your message</label>
                      <textarea
                        rows={4}
                        placeholder="Share your experience, suggestions, or any issues..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary resize-none transition-colors"
                        required
                      />
                      <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full shadow-glow">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Send to Warden
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* My Past Feedback */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Card className="glass border-border/20 h-full">
              <CardContent className="p-8">
                <h3 className="font-bold text-lg mb-4 font-serif italic flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> My Previous Feedback
                </h3>
                {!isAuthenticated ? (
                  <p className="text-muted-foreground text-sm">Log in to see your feedback history.</p>
                ) : loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : myFeedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No feedback submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {myFeedbacks.map(fb => (
                      <div key={fb.id} className="p-3 rounded-xl bg-background/50 border border-border/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-primary text-primary' : 'text-muted-foreground/20'}`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{new Date(fb.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm italic text-muted-foreground">"{fb.message}"</p>
                        {fb.warden_reply && (
                          <div className="pl-3 border-l-2 border-primary/30 mt-2">
                            <p className="text-[10px] text-muted-foreground mb-1">Warden replied:</p>
                            <p className="text-sm text-foreground">{fb.warden_reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
    </section>
  )
}
