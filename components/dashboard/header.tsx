"use client"

import { useEffect, useState } from "react"
import { Bell, Search, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { AuthManager, type User } from "@/lib/auth"

export default function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = AuthManager.getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    AuthManager.logout()
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
      <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search..." className="w-full pl-8 bg-slate-50 border-slate-200" />
        </div>

        <div className="flex items-center gap-4">
        </div>
      </header>
  )
}
