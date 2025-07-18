"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

interface Promotion {
  id: number
  name: string
}

export default function CreateProjectPage() {
  const router = useRouter()

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [minStudentsPerGroup, setMinStudentsPerGroup] = useState<number>(1)
  const [maxStudentsPerGroup, setMaxStudentsPerGroup] = useState<number>(1)
  const [type, setType] = useState("libre") // Default to 'libre'
  const [isGroupBased, setIsGroupBased] = useState(true)
  const [defenseDebutDate, setDefenseDate] = useState("")
  const [defenseDurationInMinutes, setDefenseDurationInMinutes] = useState<number>(20)
  const [criteria, setCriteria] = useState("") // Comma-separated string
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<number[]>([])
  const [groupCreationDeadline, setGroupCreationDeadline] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [reportNeeded, setReportNeeded] = useState(false)

  useEffect(() => {
    const fetchPromotions = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const promotionsResponse = await apiClient.getPromotions()
        if (promotionsResponse.error) {
          setError(promotionsResponse.error)
        } else if (promotionsResponse.data) {
          setPromotions(promotionsResponse.data)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load promotions.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchPromotions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const projectCriteria = criteria.split(',').map(c => c.trim()).filter(c => c.length > 0)

      const payload = {
        name,
        description,
        minStudentsPerGroup,
        maxStudentsPerGroup,
        type,
        isGroupBased,
        defenseDebutDate: defenseDebutDate || null,
        defenseDurationInMinutes,
        criteria: projectCriteria,
        promotionIds: selectedPromotionIds,
        groupCreationDeadline: type === "libre" ? groupCreationDeadline : null,
        isPublished,
        reportNeeded,
      }

      const response = await apiClient.createProject(payload)

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Project created successfully!")
        setTimeout(() => {
          router.push(`/dashboard/projects/${response.data.id}`)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create project.")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">Define the details for a new student project</p>
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
          <CardDescription>Fill in the information for your new project.</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStudentsPerGroup">Min Students Per Group</Label>
                  <Input
                    id="minStudentsPerGroup"
                    type="number"
                    value={minStudentsPerGroup}
                    onChange={(e) => setMinStudentsPerGroup(parseInt(e.target.value) || 1)}
                    min={1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudentsPerGroup">Max Students Per Group</Label>
                  <Input
                    id="maxStudentsPerGroup"
                    type="number"
                    value={maxStudentsPerGroup}
                    onChange={(e) => setMaxStudentsPerGroup(parseInt(e.target.value) || 1)}
                    min={1}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="libre">Libre</option>
                  <option value="manuel">Manuel</option>
                  <option value="random">Random</option>
                </select>
              </div>
              {type === "libre" && (
                <div className="space-y-2">
                  <Label htmlFor="groupCreationDeadline">Group Creation Deadline</Label>
                  <Input
                    id="groupCreationDeadline"
                    type="datetime-local"
                    value={groupCreationDeadline}
                    onChange={(e) => setGroupCreationDeadline(e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isGroupBased"
                  checked={isGroupBased}
                  onCheckedChange={setIsGroupBased}
                />
                <Label htmlFor="isGroupBased">Group Based Project</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="isPublished">Publish Project (Visible to Students)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="reportNeeded"
                  checked={reportNeeded}
                  onCheckedChange={setReportNeeded}
                />
                <Label htmlFor="reportNeeded">Report Needed</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defenseDebutDate">Defense Date</Label>
                <Input
                  id="defenseDebutDate"
                  type="datetime-local"
                  value={defenseDebutDate}
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
                <Label htmlFor="criteria">Evaluation Criteria (comma-separated)</Label>
                <Textarea
                  id="criteria"
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  placeholder="e.g., Quality, Originality, Presentation"
                  rows={3}
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
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
