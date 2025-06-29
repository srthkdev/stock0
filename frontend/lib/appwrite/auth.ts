"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createAdminClient, createSessionClient } from "./config"
import { OAuthProvider } from "appwrite"

// Create account with Google OAuth (server-side)
export async function createGoogleOAuthURL() {
  const { account } = createAdminClient()
  
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  
  try {
    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    )
    
    return { success: true, url: response.toString() }
  } catch (error) {
    console.error("Create OAuth URL error:", error)
    return { success: false, error }
  }
}



// Get current user session (server-side)
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
    
    // Try different possible session cookie names
    const possibleSessionCookies = [
      `a_session_${projectId}`,
      `a_session_${projectId}_legacy`,
      'appwrite-session'
    ]
    
    let sessionValue = null
    for (const cookieName of possibleSessionCookies) {
      const cookie = cookieStore.get(cookieName)
      if (cookie?.value) {
        sessionValue = cookie.value
        console.log(`Using session cookie: ${cookieName}`)
        break
      }
    }
    
    if (!sessionValue) {
      console.log("No session cookie found")
      return null
    }
    
    const { account } = createSessionClient(sessionValue)
    const user = await account.get()
    
    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Client-side function to get current user
export async function getClientUser() {
  try {
    const { account } = await import("./config")
    const user = await account.get()
    return user
  } catch (error) {
    console.error("Get client user error:", error)
    return null
  }
}

// Sign out user
export async function signOut() {
  const cookieStore = await cookies()
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  const session = cookieStore.get(`a_session_${projectId}`)
  
  if (session) {
    try {
      const { account } = createSessionClient(session.value)
      await account.deleteSession("current")
    } catch (error) {
      console.log("Session already invalid or expired")
    }
  }
  
  // Delete all possible session cookies
  cookieStore.delete(`a_session_${projectId}`)
  cookieStore.delete(`a_session_${projectId}_legacy`)
  cookieStore.delete("appwrite-session") // Legacy cookie
  
  // Clear any other Appwrite related cookies
  try {
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.includes('appwrite') || cookie.name.includes('a_session')) {
        cookieStore.delete(cookie.name)
      }
    })
  } catch (error) {
    console.log("Error clearing additional cookies")
  }
  
  // Revalidate the root layout to update user state
  revalidatePath("/", "layout")
  
  redirect("/")
} 