"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { account } from "./config"
import { Models } from "appwrite"

interface UserContextType {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  setUser: (user: Models.User<Models.Preferences> | null) => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  refreshUser: async () => {},
})

export function UserProvider({ 
  children,
  initialUser = null
}: { 
  children: React.ReactNode
  initialUser?: Models.User<Models.Preferences> | null
}) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)

  const refreshUser = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true)
      const currentUser = await account.get()
      console.log("User fetched successfully:", currentUser)
      setUser(currentUser)
    } catch (error: any) {
      console.log("No authenticated user:", error?.message || error)
      
      // If this is an OAuth redirect and we don't have a user yet, retry a few times
      if (retryCount < 3 && window.location.pathname === '/dashboard') {
        console.log(`Retrying user fetch in 500ms (attempt ${retryCount + 1}/3)`)
        setTimeout(() => refreshUser(retryCount + 1), 500)
        return
      }
      
      setUser(null)
    } finally {
      if (retryCount === 0) { // Only set loading false on the initial call
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!initialUser) {
      refreshUser()
    }
  }, [initialUser, refreshUser])

  // Listen for URL changes to refresh user after OAuth redirect
  useEffect(() => {
    const handleFocus = () => {
      if (!loading) {
        refreshUser()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading) {
        refreshUser()
      }
    }

    // Refresh when window gains focus or becomes visible
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Also refresh on page navigation
    const handleBeforeUnload = () => {
      refreshUser()
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [loading, refreshUser])

  // Refresh user on mount and after any route change
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Listen for storage events (like when cookies are cleared by sign out)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshUser()
    }

    // Listen for custom events that might indicate auth state changes
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('popstate', handleStorageChange)
    }
  }, [refreshUser])

  return (
    <UserContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
} 