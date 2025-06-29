"use client"

import { useUser } from "@/lib/appwrite/user-provider"
import { account } from "@/lib/appwrite/config"
import { useState } from "react"

export default function TestAuthPage() {
  const { user, loading, refreshUser } = useUser()
  const [testResult, setTestResult] = useState<string>("")

  const testClientAuth = async () => {
    try {
      const clientUser = await account.get()
      setTestResult(`✅ Client auth works: ${clientUser.email}`)
    } catch (error: any) {
      setTestResult(`❌ Client auth failed: ${error.message}`)
    }
  }

  const checkCookies = () => {
    const cookies = document.cookie.split(';')
    const allCookies = cookies.map(cookie => cookie.trim())
    const appwriteCookies = allCookies.filter(cookie => 
      cookie.includes('a_session_') || cookie.includes('appwrite')
    )
    setTestResult(`🍪 All cookies: ${JSON.stringify(allCookies, null, 2)}\n\n🔑 Appwrite cookies: ${JSON.stringify(appwriteCookies, null, 2)}`)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Provider State:</h2>
          <p>Loading: {loading ? "Yes" : "No"}</p>
          <p>User: {user ? `✅ ${user.email}` : "❌ No user"}</p>
        </div>

        <div className="space-x-2">
          <button 
            onClick={testClientAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Client Auth
          </button>
          
          <button 
            onClick={checkCookies}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Check Cookies
          </button>
          
          <button 
            onClick={refreshUser}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Refresh User
          </button>
        </div>

        {testResult && (
          <div className="bg-gray-100 p-4 rounded">
            <pre>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  )
} 