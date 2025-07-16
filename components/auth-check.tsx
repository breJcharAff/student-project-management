"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AuthManager, type User } from "@/lib/auth"

interface AuthCheckProps {
    children: React.ReactNode
}

export default function AuthCheck({ children }: AuthCheckProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const [authChecked, setAuthChecked] = useState(false)
    const router = useRouter()

    const checkAuth = () => {
        console.log("Checking authentication...")

        const isAuth = AuthManager.isAuthenticated()
        const userData = AuthManager.getUser()
        const token = AuthManager.getToken()

        console.log("Auth check results:", { isAuth, userData, hasToken: !!token, isTokenExpired: AuthManager.isTokenExpired() })

        if (!isAuth) {
            console.log("AuthCheck: Not authenticated. User:", userData, "Token:", token ? "exists" : "null", "Expired:", AuthManager.isTokenExpired(), "Redirecting to login.")
            AuthManager.logout() // Ensure localStorage is cleared
            router.push("/login")
            return
        }

        if (userData) {
            console.log("AuthCheck: User authenticated:", userData)
            setUser(userData)
        } else {
            console.log("AuthCheck: No user data found despite being authenticated. This is unexpected. Redirecting to login.")
            AuthManager.logout() // Clear potentially corrupted state
            router.push("/login")
            return
        }

        setAuthChecked(true)
        setIsLoading(false)
    }

    useEffect(() => {
        // Initial auth check
        checkAuth()

        // Listen for auth changes
        const handleAuthChange = () => {
            console.log("Auth change detected")
            checkAuth()
        }

        window.addEventListener("auth-change", handleAuthChange)

        // Also listen for storage changes (in case of logout from another tab)
        window.addEventListener("storage", handleAuthChange)

        return () => {
            window.removeEventListener("auth-change", handleAuthChange)
            window.removeEventListener("storage", handleAuthChange)
        }
    }, [router])

    if (isLoading || !authChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    <p className="text-slate-500">Checking authentication...</p>
                </div>
            </div>
        )
    }

    return children
}
