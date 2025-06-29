import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface LandingPageProps {
  searchParams: {
    error?: string
    message?: string
  }
}

export default function LandingPage({ searchParams }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stock0
            </span>
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Your comprehensive stock market dashboard with real-time data, 
            market analysis, and portfolio management tools.
          </p>
          
          {/* Error Messages */}
          {searchParams.error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {searchParams.error === "auth_required" && "Please sign in to access that page."}
              {searchParams.error === "oauth_failed" && "Authentication failed. Please try again."}
              {searchParams.error === "missing_params" && "Authentication error. Please try again."}
              {searchParams.error === "server_error" && "Server error occurred. Please try again."}
              {searchParams.message && (
                <div className="mt-2 text-sm">{searchParams.message}</div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/dashboard">
                Get Started
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Why Choose Stock0?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Real-time Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Get up-to-the-minute stock prices, market indices, and financial data
                  powered by reliable APIs.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔍 Smart Screening
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Filter and discover stocks based on various criteria including 
                  sector performance and market cap.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Access comprehensive charts, technical indicators, and 
                  market sentiment analysis tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
