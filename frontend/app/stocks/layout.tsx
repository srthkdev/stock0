import { AuthGuard } from "@/components/auth-guard"

export default function StocksLayout({
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