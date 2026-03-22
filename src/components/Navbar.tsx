import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { 
  Menu, X, Moon, Sun, Droplets, Gamepad2, Flower2, LogIn, User, LogOut, LayoutDashboard, Calendar, WashingMachine, ShoppingBag, Zap, MessageSquare, Users
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Link, useNavigate } from '@tanstack/react-router'
import { SparkleOrbitLogo } from '@/components/SparkleOrbitLogo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export function Navbar() {
  const { theme, setTheme } = useAppTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, isWarden, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const themeIcons = {
    rose: <Flower2 className="w-5 h-5" />,
    ocean: <Droplets className="w-5 h-5" />,
    dark: <Moon className="w-5 h-5" />,
    cyberpunk: <Gamepad2 className="w-5 h-5" />,
  }

  const navLinks = [
    ...(!isAuthenticated ? [{ name: 'Home', href: '/' as any, icon: <Menu className="w-5 h-5" /> }] : []),
    ...(isAuthenticated && !isWarden ? [
      { name: 'Book Slot', href: '/booking' as any, icon: <Calendar className="w-5 h-5" /> },
      { name: 'My Laundry', href: '/laundry' as any, icon: <WashingMachine className="w-5 h-5" /> },
    ] : []),
    ...(isWarden ? [
      { name: 'Dashboard Home', href: '/warden' as any, search: '?tab=bookings', icon: <LayoutDashboard className="w-5 h-5" /> },
      { name: 'Slot Bookings', href: '/warden' as any, search: '?tab=bookings', icon: <Calendar className="w-5 h-5" /> },
      { name: 'Book for Student', href: '/warden' as any, search: '?tab=book-for-student', icon: <WashingMachine className="w-5 h-5" /> },
      { name: 'Orders', href: '/warden' as any, search: '?tab=orders', icon: <ShoppingBag className="w-5 h-5" /> },
      { name: 'Requests', href: '/warden' as any, search: '?tab=requests', icon: <Zap className="w-5 h-5" /> },
      { name: 'Feedback', href: '/warden' as any, search: '?tab=feedback', icon: <MessageSquare className="w-5 h-5" /> },
      { name: 'Students Directory', href: '/warden' as any, search: '?tab=students', icon: <Users className="w-5 h-5" /> },
    ] : []),
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'h-20 glass backdrop-blur-md border-b border-white/5' : 'h-24 bg-transparent'}`}>
        <div className="container mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group hover:scale-105 transition-transform duration-300">
            <SparkleOrbitLogo size="sm" />
            <span className="text-2xl font-bold tracking-tighter gradient-text hidden sm:block">Sparkle Hostel</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-3 p-1.5 pr-5 rounded-full glass border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 group shadow-lg"
              >
                <Avatar className="w-10 h-10 border-2 border-primary/40 group-hover:border-primary transition-colors">
                  <AvatarImage src={user?.profile_pic || ''} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-sm font-bold leading-tight">{user?.name?.split(' ')[0]}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{user?.role}</span>
                </div>
                <Menu className="w-4 h-4 text-muted-foreground ml-2 group-hover:text-primary transition-colors" />
              </button>
            ) : (
              <Button className="rounded-full px-8 h-12 shadow-glow hover:scale-105 transition-transform" onClick={() => window.location.href = '/login'}>
                <LogIn className="w-4 h-4 mr-2" /> Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] glass border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/10 bg-black/20">
                <span className="font-mono text-sm uppercase tracking-widest text-primary font-bold">Command Hub</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                {isAuthenticated && user && (
                  <div className="flex items-center gap-4 py-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/30 shadow-glow">
                      <AvatarImage src={user.profile_pic || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xl font-bold leading-none">{user.name}</span>
                      <span className="text-sm text-muted-foreground mt-1">{user.email}</span>
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full w-fit">{user.role}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Navigation</span>
                  {navLinks.map((link: any) => (
                    link.search ? (
                      <a
                        key={link.name}
                        href={`${link.href}${link.search}`}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors group [&.active]:bg-primary/20"
                      >
                        <div className="text-muted-foreground group-hover:text-primary transition-colors group-[.active]:text-primary">
                          {link.icon}
                        </div>
                        <span className="font-bold text-lg group-[.active]:text-primary">{link.name}</span>
                      </a>
                    ) : (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors group [&.active]:bg-primary/20"
                      >
                        <div className="text-muted-foreground group-hover:text-primary transition-colors group-[.active]:text-primary">
                          {link.icon}
                        </div>
                        <span className="font-bold text-lg group-[.active]:text-primary">{link.name}</span>
                      </Link>
                    )
                  ))}
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/10 transition-colors group [&.active]:bg-primary/20"
                    >
                      <User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-[.active]:text-primary" />
                      <span className="font-bold text-lg group-[.active]:text-primary">My Profile</span>
                    </Link>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Theme</span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['rose', 'ocean', 'dark', 'cyberpunk'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                          theme === t ? 'bg-primary border border-primary text-black shadow-glow scale-105' : 'bg-black/20 hover:bg-white/10 border border-white/5 text-muted-foreground'
                        }`}
                      >
                        {themeIcons[t]}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isAuthenticated && (
                  <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-xl text-lg font-bold shadow-lg"
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-3" /> Sign Out
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}