"use client"
import { ThemeToggle } from "./theme-toggle"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import Link from "next/link"

import { usePathname } from "next/navigation"
import CommandMenu from "./command-menu"
import { AuthButton } from "./auth-button"
import { useUser } from "@/lib/appwrite/user-provider"
import DynamicBreadcrumbs from "./breadcrumbs"

const NAVIGATION = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Screener", href: "/screener" },
  { title: "Portfolio", href: "/portfolio" },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()

  // Show different navigation for landing vs authenticated pages
  const showFullNav = pathname !== "/"

    return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex w-full flex-row justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Stock0
            </Link>
            {showFullNav && user && <DynamicBreadcrumbs />}
          </div>
          <div className="flex flex-row items-center gap-2">
            {showFullNav && user && (
              <NavigationMenu>
                <NavigationMenuList>
                  {NAVIGATION.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <Link href={item.href} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          {item.title}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}
            {showFullNav && user && <CommandMenu />}
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
