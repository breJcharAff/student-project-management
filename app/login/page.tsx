"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: number
  email: string
  name: string
  role: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking")
  const router = useRouter()

  // Check if the backend is reachable
  useState(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (response.ok) {
          setBackendStatus("online")
        } else {
          setBackendStatus("offline")
        }
      } catch (error) {
        console.error("Backend check error:", error)
        setBackendStatus("offline")
      }
    }

    checkBackend()
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Use our Next.js API route as a proxy to the backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = "Invalid email or password"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If we can't parse the JSON, just use the default error message
        }
        throw new Error(errorMessage)
      }

      const userData = await response.json()

      // Store user data in localStorage
      localStorage.setItem("currentUser", JSON.stringify(userData))

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Mock login function for testing when the backend is unavailable
  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      if (email === "alice@example.com" && password === "password") {
        const userData = {
          id: 1,
          email: "alice@example.com",
          name: "Alice",
          role: "student",
        }
        localStorage.setItem("currentUser", JSON.stringify(userData))
        router.push("/dashboard")
      } else if (email === "stella@example.com" && password === "password") {
        const userData = {
          id: 2,
          email: "stella@example.com",
          name: "Stella",
          role: "teacher",
        }
        localStorage.setItem("currentUser", JSON.stringify(userData))
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Microsoft
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              {backendStatus === "checking" && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500 mr-2" />
                    <span className="text-sm text-slate-500">Checking server status...</span>
                  </div>
              )}

              {backendStatus === "offline" && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      Backend server appears to be offline. You can still use mock login for testing.
                    </AlertDescription>
                  </Alert>
              )}

              <form onSubmit={backendStatus === "online" ? handleLogin : handleMockLogin}>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-slate-500 hover:text-slate-900">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                  </Button>
                </div>
                {backendStatus !== "online" && (
                    <div className="mt-4 text-xs text-slate-500 text-center">
                      <p>Using mock login mode for testing. Real authentication is disabled.</p>
                    </div>
                )}
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="mt-2 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/contact" className="font-medium text-slate-900 hover:underline">
                Contact administrator
              </Link>
            </p>
            <div className="mt-4 text-xs text-slate-400">
              <p>Demo accounts:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>alice@example.com (Student)</li>
                <li>stella@example.com (Teacher)</li>
              </ul>
              <p className="mt-1">Password for all accounts: "password"</p>
            </div>
          </CardFooter>
        </Card>
      </div>
  )
}
