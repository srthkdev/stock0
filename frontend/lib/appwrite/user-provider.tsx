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

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error: any) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialUser) {
      refreshUser()
    }
  }, [initialUser, refreshUser])

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