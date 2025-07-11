"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { MultiSelect } from "@/components/ui/multi-select"

interface Project {
  id: number
  name: string
  description: string
  isPublished: boolean
  promotions: Array<{ id: number; name: string }>
}

interface Promotion {
  id: number
  name: string
}

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<number[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const projectResponse = await apiClient.getProject(projectId)
        const promotionsResponse = await apiClient.getPromotions()

        if (projectResponse.error) {
          setError(projectResponse.error)
          setIsLoading(false)
          return
        }
        if (promotionsResponse.error) {
          setError(promotionsResponse.error)
          setIsLoading(false)
          return
        }

        const fetchedProject = projectResponse.data
        const fetchedPromotions = promotionsResponse.data

        setProject(fetchedProject)
        setPromotions(fetchedPromotions)

        setName(fetchedProject.name)
        setDescription(fetchedProject.description)
        setIsPublished(fetchedProject.isPublished)
        setSelectedPromotionIds(fetchedProject.promotions.map((p: Promotion) => p.id))
      } catch (err: any) {
        setError(err.message || "Failed to load data.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiClient.updateProject(projectId, {
        name,
        description,
        isPublished,
        promotionIds: selectedPromotionIds,
      })

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Project updated successfully!")
        // Optionally, redirect after a short delay
        setTimeout(() => {
          router.push(`/dashboard/projects/${projectId}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update project.")
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

  if (error && !project) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Project: {project.name}</h1>
          <p className="text-muted-foreground">Modify the details of your project</p>
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
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Update basic information and visibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="isPublished">Publish Project (Visible to Students)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promotions">Associated Promotions</Label>
                <MultiSelect
                  options={promotions.map((p) => ({ label: p.name, value: p.id }))}
                  selected={selectedPromotionIds}
                  onSelectedChange={setSelectedPromotionIds}
                  placeholder="Select promotions..."
                />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
