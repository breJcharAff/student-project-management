"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthManager } from "@/lib/auth"
import { apiClient } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (AuthManager.isAuthenticated()) {
      console.log("Already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login...")
      const response = await apiClient.login(email, password)

      if (response.error) {
        console.log("Login error:", response.error)
        setError(response.error)
        return
      }

      if (response.data) {
        console.log("Login successful, storing auth data:", response.data)

        // Store authentication data
        AuthManager.login(response.data)

        // Wait a moment to ensure data is stored
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Verify the data was stored
        const storedUser = AuthManager.getUser()
        const storedToken = AuthManager.getToken()
        console.log("Verification - stored user:", storedUser, "stored token:", !!storedToken)

        if (storedUser && storedToken) {
          console.log("Auth data verified, redirecting to dashboard")
          // Use replace instead of push to prevent back navigation to login
          router.replace("/dashboard")
        } else {
          console.error("Failed to store auth data")
          setError("Failed to store authentication data. Please try again.")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
                <Button variant="outline" disabled>
                  <Github className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" disabled>
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

              <form onSubmit={handleLogin}>
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
                <li>raph@example.com (Student)</li>
                <li>stella@example.com (Teacher)</li>
              </ul>
              <p className="mt-1">Use your actual password</p>
            </div>
          </CardFooter>
        </Card>
      </div>
  )
}
