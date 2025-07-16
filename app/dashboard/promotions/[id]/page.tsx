"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle, Users as UsersIcon, GraduationCap } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"

interface Teacher {
  id: number
  name: string
  email: string
}

interface Student {
  id: number
  name: string
  email: string
}

interface Promotion {
  id: number
  name: string
  teachers: Teacher[]
  students: Student[]
}

export default function PromotionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const promotionId = params.id as string

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPromotion = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.getPromotion(promotionId)
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setPromotion(response.data)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load promotion details.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchPromotion()
  }, [promotionId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error && !promotion) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (!promotion) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Promotion Not Found</h2>
        <p className="text-muted-foreground mb-4">The promotion you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotion: {promotion.name}</h1>
          <p className="text-muted-foreground">Details for this academic promotion.</p>
        </div>
        <div className="flex gap-2">
            <Link href={`/dashboard/promotions/${promotionId}/add-student`}>
                <Button>Add Students</Button>
            </Link>
            <Button onClick={() => router.push("/dashboard/promotions")} variant="outline">
                Back to Promotions List
            </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Teachers ({promotion.teachers.length})</CardTitle>
          <CardDescription>Teachers associated with this promotion.</CardDescription>
        </CardHeader>
        <CardContent>
          {promotion.teachers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No teachers assigned to this promotion.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {promotion.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students ({promotion.students.length})</CardTitle>
          <CardDescription>Students enrolled in this promotion.</CardDescription>
        </CardHeader>
        <CardContent>
          {promotion.students.length === 0 ? (
            <p className="text-muted-foreground text-sm">No students enrolled in this promotion.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {promotion.students.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <UsersIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
