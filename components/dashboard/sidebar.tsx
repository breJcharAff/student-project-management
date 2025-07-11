"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, FileText, Home, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { AuthManager, type User } from "@/lib/auth"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = AuthManager.getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    AuthManager.logout()
    router.push("/login")
  }

  const teacherNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Classes",
      href: "/dashboard/classes",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Promotions",
      href: "/dashboard/promotions",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Deliverables",
      href: "/dashboard/deliverables",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Schedule",
      href: "/dashboard/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "My Groups",
      href: "/dashboard/groups",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Deliverables",
      href: "/dashboard/deliverables",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Schedule",
      href: "/dashboard/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const navItems = user?.role === "teacher" ? teacherNavItems : studentNavItems

  return (
      <div className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <span className="font-bold text-xl">ProjectHub</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
              <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
              >
                {item.icon}
                {item.title}
              </Link>
          ))}
        </div>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
  )
}
