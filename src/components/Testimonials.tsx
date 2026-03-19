import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { MessageSquare, Send, Loader2, Lock, Star } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function Testimonials() {
  const { user, isAuthenticated, isWarden } = useAuth()
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) { toast.error('Please write something'); return }
    if (!user) { toast.error('Please log in to leave feedback'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        message: message.trim(),
        rating: rating || null,
      })
      if (error) throw error
      setSubmitted(true)
      setMessage('')
      setRating(0)
      toast.success('Feedback sent to warden! Thank you 💬')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 px-6 py-1 bg-primary/20 text-primary border-primary/20">
            <Lock className="w-3 h-3 mr-1" /> Private to Warden
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 italic font-serif">
            Share Your <span className="text-primary">Feedback</span>
          </h2>
          <p className="text-muted-foreground text-lg italic">
            Your comments go directly and privately to the warden. Be honest — only they can read this.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Not logged in */}
          {!isAuthenticated && (
            <Card className="glass border-primary/20">
              <CardContent className="p-10 text-center space-y-4">
                <MessageSquare className="w-12 h-12 mx-auto text-primary/40" />
                <p className="text-muted-foreground font-serif italic">
                  Log in as a student to leave feedback for the warden.
                </p>
                <Link to="/login">
                  <Button className="shadow-glow">Login to Write Feedback</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Warden - can't submit their own feedback */}
          {isAuthenticated && isWarden && (
            <Card className="glass border-primary/20">
              <CardContent className="p-10 text-center space-y-3">
                <Lock className="w-10 h-10 mx-auto text-primary/40" />
                <p className="text-muted-foreground font-serif italic">
                  You are logged in as Warden. View student feedback from your Dashboard.
                </p>
                <Link to="/warden">
                  <Button variant="outline">Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Student - show form or thank you */}
          {isAuthenticated && !isWarden && (
            submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="glass border-green-500/30">
                  <CardContent className="p-10 text-center space-y-3">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Send className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold font-serif">Feedback Sent!</h3>
                    <p className="text-muted-foreground text-sm">
                      Your message has been sent privately to the warden. They may reply to you.
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send Another
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="glass border-primary/20 shadow-glow">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star rating */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating (optional)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-7 h-7 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Write your feedback, suggestions, or complaints here. Only the warden can read this."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border/40 bg-background/50 text-sm focus:outline-none focus:border-primary transition-colors resize-none font-serif italic"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Completely private — only the warden sees this
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 shadow-glow text-base font-semibold"
                    >
                      {submitting
                        ? <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        : <Send className="w-5 h-5 mr-2" />}
                      Send to Warden
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          )}
        </motion.div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
    </section>
  )
}
