import { AuthGuard } from "@/components/auth-guard"

export default function ScreenerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
} 