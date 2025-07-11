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
import { Loader2, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { MultiSelect } from "@/components/ui/multi-select"

interface Project {
  id: number
  name: string
  description: string
  isPublished: boolean
  defenseDate: string
  defenseDurationInMinutes: number
  promotions: Array<{ id: number; name: string }>
  groups?: Array<{ id: number; isFinal: boolean }>
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
  const [defenseDate, setDefenseDate] = useState("")
  const [defenseDurationInMinutes, setDefenseDurationInMinutes] = useState<number>(0)
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<number[]>([])
  const [isGradesFinalized, setIsGradesFinalized] = useState(false)
  const [initialIsGradesFinalized, setInitialIsGradesFinalized] = useState(false)

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
      setDefenseDate(fetchedProject.defenseDate ? new Date(fetchedProject.defenseDate).toISOString().slice(0, 16) : "")
      setDefenseDurationInMinutes(fetchedProject.defenseDurationInMinutes || 0)
      setSelectedPromotionIds(fetchedProject.promotions.map((p: Promotion) => p.id))

      // Determine initial isGradesFinalized state based on the first group's isFinal status
      let gradesFinalized = false;
      if (fetchedProject.groups && fetchedProject.groups.length > 0) {
        const firstGroup = fetchedProject.groups[0]
        // Fetch the full group details to get the isFinal status
        const groupDetailsResponse = await apiClient.getGroup(firstGroup.id.toString())
        if (!groupDetailsResponse.error && groupDetailsResponse.data) {
          gradesFinalized = groupDetailsResponse.data.isFinal || false
        } else if (groupDetailsResponse.error) {
          console.error("Failed to fetch first group details:", groupDetailsResponse.error)
        }
      }
      setIsGradesFinalized(gradesFinalized)
      setInitialIsGradesFinalized(gradesFinalized)

    } catch (err: any) {
      setError(err.message || "Failed to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const projectUpdatePayload = {
        name,
        description,
        isPublished,
        defenseDate: defenseDate || null,
        defenseDurationInMinutes: defenseDurationInMinutes || null,
        promotionIds: selectedPromotionIds,
      }
      const projectUpdateResponse = await apiClient.updateProject(projectId, projectUpdatePayload)

      if (projectUpdateResponse.error) {
        setError(projectUpdateResponse.error)
        setIsSaving(false)
        return
      }

      // Only call finalizeProjectGrades if the state has changed
      if (isGradesFinalized !== initialIsGradesFinalized) {
        const finalizeResponse = await apiClient.finalizeProjectGrades(projectId, isGradesFinalized)
        if (finalizeResponse.error) {
          setError(finalizeResponse.error)
          setIsSaving(false)
          return
        }
      }

      setSuccess("Project updated successfully!")
      setTimeout(() => {
        router.push(`/dashboard/projects/${projectId}`)
      }, 2000)

    } catch (err: any) {
      setError(err.message || "Failed to update project.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await apiClient.deleteProject(projectId)
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Project deleted successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete project.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalizeGrades = (checked: boolean) => {
    setIsGradesFinalized(checked)
  }

  // Determine initial isGradesFinalized state based on the first group's isFinal status
  // This is now handled by the state variable `isGradesFinalized` and `initialIsGradesFinalized`

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
        <Button variant="destructive" onClick={handleDeleteProject} disabled={isSaving}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Project
        </Button>
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
                <Label htmlFor="defenseDate">Defense Date</Label>
                <Input
                  id="defenseDate"
                  type="datetime-local"
                  value={defenseDate}
                  onChange={(e) => setDefenseDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defenseDuration">Defense Duration (minutes)</Label>
                <Input
                  id="defenseDuration"
                  type="number"
                  value={defenseDurationInMinutes}
                  onChange={(e) => setDefenseDurationInMinutes(parseInt(e.target.value) || 0)}
                />
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="finalizeGrades"
                  checked={isGradesFinalized}
                  onCheckedChange={handleFinalizeGrades}
                />
                <Label htmlFor="finalizeGrades">Finalize Project Grades</Label>
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