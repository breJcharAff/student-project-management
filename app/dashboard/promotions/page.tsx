"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {Loader2, AlertTriangle, CheckCircle, Users as UsersIcon, GraduationCap, Info} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager, type User } from "@/lib/auth"
import {useRouter} from "next/navigation";

interface Promotion {
  id: number
  name: string
  teachers: Array<{ id: number; name: string; email: string }>
  students: Array<{ id: number; name: string; email: string }>
}

export default function PromotionsListPage() {
  const [user, setUser] = useState<User | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = AuthManager.getUser()
    setUser(userData)
  }, [])

  const fetchPromotions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getPromotions()
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setPromotions(response.data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load promotions.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPromotions()
    }
  }, [user])

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Manage student promotions.</p>
        </div>
        {user.role === "teacher" && (
          <Button asChild>
            <Link href="/dashboard/promotions/new">Create New Promotion</Link>
          </Button>
        )}
      </div>

      {promotions.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Promotions Found</AlertTitle>
          <AlertDescription>No promotions have been created yet.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader>
                <CardTitle>{promotion.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <UsersIcon className="h-4 w-4" />
                    {promotion.students.length} Students
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <GraduationCap className="h-4 w-4" />
                    {promotion.teachers.map(t => t.name).join(', ') || 'No Teachers'}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/promotions/${promotion.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
