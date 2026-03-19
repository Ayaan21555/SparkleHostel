import React from 'react'
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  RouterProvider, 
  Outlet 
} from '@tanstack/react-router'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Booking from './pages/Booking'
import Laundry from './pages/Laundry'
import Profile from './pages/Profile'
import WardenDashboard from './pages/WardenDashboard'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking',
  component: Booking,
})

const laundryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/laundry',
  component: Laundry,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
})

const wardenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/warden',
  component: WardenDashboard,
})

const routeTree = rootRoute.addChildren([
  indexRoute, 
  loginRoute, 
  bookingRoute, 
  laundryRoute, 
  profileRoute,
  wardenRoute
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
