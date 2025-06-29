"use client"

import { Button } from "./button"
import { clientSignOut } from "@/lib/appwrite/client-auth"
import { account } from "@/lib/appwrite/config"
import { OAuthProvider } from "appwrite"

interface AuthButtonProps {
  user: any
}

export function AuthButton({ user }: AuthButtonProps) {
  const handleGoogleSignIn = () => {
    try {
      // Use the default Appwrite OAuth flow
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/dashboard`, // Success redirect
        `${window.location.origin}/?error=oauth_failed` // Failure redirect
      )
    } catch (error) {
      console.error("Google sign in error:", error)
    }
  }

  const handleSignOut = async () => {
    await clientSignOut()
  }

  if (user) {
    return (
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    )
  }

  return (
    <Button onClick={handleGoogleSignIn}>
      Sign in with Google
    </Button>
  )
} 