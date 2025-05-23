"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
    children: React.ReactNode
}

interface User {
    id: number
    email: string
    name: string
    role: string
}

export default function AuthCheck({ children }: AuthCheckProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem("currentUser")

        if (!storedUser) {
            router.push("/login")
            return
        }

        try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
        } catch (error) {
            console.error("Error parsing user data:", error)
            localStorage.removeItem("currentUser")
            router.push("/login")
            return
        }

        setIsLoading(false)
    }, [router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        )
    }

    return children
}
