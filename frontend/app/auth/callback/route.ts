import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/appwrite/config"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const secret = url.searchParams.get("secret")
  const error = url.searchParams.get("error")

  console.log("OAuth callback received:", { secret, error })

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error)
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url))
  }

  // Validate required parameters
  if (!secret) {
    console.error("Missing secret in callback")
    return NextResponse.redirect(new URL("/?error=missing_params", request.url))
  }

  try {
    // Set session cookies in Appwrite format using the secret
    const cookieStore = await cookies()
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
    
    // Set the session cookies that Appwrite client expects
    cookieStore.set(`a_session_${projectId}`, secret, {
      httpOnly: false, // Client needs access
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    
    cookieStore.set(`a_session_${projectId}_legacy`, secret, {
      httpOnly: false, // Client needs access
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    
    console.log("Session cookies set successfully")
    
    // Redirect to dashboard on successful authentication
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/?error=server_error", request.url))
  }
} 