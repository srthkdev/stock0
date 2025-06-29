import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ViewTransitions } from "next-view-transitions"
import { ThemeProvider } from "@/components/ui/theme-provider"
import Navigation from "@/components/ui/navigation"
import Footer from "@/components/ui/footer"
import { UserProvider } from "@/lib/appwrite/user-provider"
import { getCurrentUser } from "@/lib/appwrite/auth"
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern"
import { cn } from "@/lib/utils"

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock0: Stock Market Dashboard & Analysis",
  description:
    "Stock0 is your comprehensive stock market dashboard with real-time data, market analysis, and portfolio management tools.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} min-h-screen bg-background pb-6 antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black relative`}
        >
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
              "z-0",
            )}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <UserProvider initialUser={user}>
              <div className="relative z-10">
                <Navigation />
                <main className="container">{children}</main>
                <Footer />
              </div>
            </UserProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
