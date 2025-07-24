"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { MultiSelect } from "@/components/ui/multi-select"
import Link from "next/link";

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function CreatePromotionPage() {
  const router = useRouter()

  const [teachers, setTeachers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([])

  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const usersResponse = await apiClient.getUsers()
        if (usersResponse.error) {
          setError(usersResponse.error)
        } else if (usersResponse.data) {
          setTeachers(usersResponse.data.filter((user: User) => user.role === "teacher"))
        }
      } catch (err: any) {
        setError(err.message || "Failed to load teachers.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        name,
        teacherIds: selectedTeacherIds,
      }

      const response = await apiClient.createPromotion(payload)

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Promotion created successfully!")
        setTimeout(() => {
          router.push(`/dashboard/promotions/${response.data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create promotion.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link href={`/dashboard/promotions`}>
          <Button variant="outline">Back to Promotions</Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Promotion</h1>
          <p className="text-muted-foreground">Define the details for a new student promotion</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Promotion Details</CardTitle>
          <CardDescription>Fill in the information for your new promotion.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Promotion Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teachers">Assign Teachers</Label>
                <MultiSelect
                  options={teachers.map((t) => ({ label: t.name, value: t.id }))}
                  selected={selectedTeacherIds}
                  onSelectedChange={setSelectedTeacherIds}
                  placeholder="Select teachers..."
                />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Promotion"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
