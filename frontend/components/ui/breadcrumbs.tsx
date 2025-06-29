"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { fetchCompanyProfile } from "@/lib/finnhub/fetchCompanyProfile"

interface BreadcrumbSegment {
  title: string
  href?: string
  isCurrentPage?: boolean
}

export default function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const [stockName, setStockName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Parse the pathname to determine breadcrumb segments
  const getBreadcrumbSegments = async (): Promise<BreadcrumbSegment[]> => {
    const segments: BreadcrumbSegment[] = []

    // Always start with Stock0
    segments.push({
      title: "Stock0",
      href: "/",
    })

    // Parse the current path
    const pathSegments = pathname.split("/").filter(Boolean)

    if (pathSegments.length === 0 || pathname === "/") {
      return segments
    }

    // Handle dashboard route
    if (pathSegments[0] === "dashboard") {
      segments.push({
        title: "Dashboard",
        href: pathSegments.length === 1 ? undefined : "/dashboard",
        isCurrentPage: pathSegments.length === 1,
      })
    }

    // Handle screener route
    if (pathSegments[0] === "screener") {
      segments.push({
        title: "Screener",
        href: pathSegments.length === 1 ? undefined : "/screener",
        isCurrentPage: pathSegments.length === 1,
      })
    }

    // Handle stocks route
    if (pathSegments[0] === "stocks" && pathSegments.length >= 2) {
      const ticker = pathSegments[1].toUpperCase()
      
      // Add the stock segment
      if (stockName) {
        segments.push({
          title: stockName,
          isCurrentPage: true,
        })
      } else {
        segments.push({
          title: ticker,
          isCurrentPage: true,
        })
      }
    }

    return segments
  }

  // Fetch stock name when on stock page
  useEffect(() => {
    const loadStockName = async () => {
      const pathSegments = pathname.split("/").filter(Boolean)
      
      if (pathSegments[0] === "stocks" && pathSegments.length >= 2) {
        const ticker = pathSegments[1]
        setIsLoading(true)
        
        try {
          const profile = await fetchCompanyProfile(ticker)
          setStockName(profile.name || ticker.toUpperCase())
        } catch (error) {
          console.error("Failed to fetch stock name:", error)
          setStockName(ticker.toUpperCase())
        } finally {
          setIsLoading(false)
        }
      } else {
        setStockName("")
      }
    }

    loadStockName()
  }, [pathname])

  const [segments, setSegments] = useState<BreadcrumbSegment[]>([])

  useEffect(() => {
    getBreadcrumbSegments().then(setSegments)
  }, [pathname, stockName])

  // Only show breadcrumbs on stock pages
  const pathSegments = pathname.split("/").filter(Boolean)
  if (pathSegments[0] !== "stocks" || pathSegments.length < 2) {
    return null
  }

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span>/</span>
      <span>
        {isLoading ? "Loading..." : stockName || pathSegments[1].toUpperCase()}
      </span>
    </div>
  )
} 