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
import { Loader2, CheckCircle, AlertTriangle, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import { MultiSelect } from "@/components/ui/multi-select"

interface Promotion {
  id: number
  name: string
}

interface Criterion {
  name: string
  weight: number
}

interface EvaluationGrid {
  title: string
  target: string
  criteria: Criterion[]
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
  const [reportNeeded, setReportNeeded] = useState(false)
  const [evaluationGrids, setEvaluationGrids] = useState<Record<string, EvaluationGrid>>({
    defense: { title: "Grille soutenance", target: "defense", criteria: [] },
    deliverable: { title: "Grille livrable", target: "deliverable", criteria: [] },
    report: { title: "Grille rapport", target: "report", criteria: [] },
  })
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<number[]>([])
  const [groupCreationDeadline, setGroupCreationDeadline] = useState("")
  const [isPublished, setIsPublished] = useState(false)

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
      const gridsToSubmit = [
        evaluationGrids.defense,
        evaluationGrids.deliverable,
      ]
      if (reportNeeded) {
        gridsToSubmit.push(evaluationGrids.report)
      }

      const payload = {
        name,
        description,
        minStudentsPerGroup,
        maxStudentsPerGroup,
        type,
        isGroupBased,
        defenseDebutDate: defenseDebutDate || null,
        defenseDurationInMinutes,
        evaluationGrids: gridsToSubmit,
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
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Evaluation Grids</h3>
                {Object.entries(evaluationGrids).map(([key, grid]) => {
                  if (key === 'report' && !reportNeeded) return null
                  return (
                    <div key={key} className="p-4 border rounded-md">
                      <h4 className="font-semibold">{grid.title}</h4>
                      <div className="space-y-2 mt-2">
                        {grid.criteria.map((c, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <span>{c.name} ({c.weight})</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newGrids = { ...evaluationGrids }
                                newGrids[key].criteria.splice(index, 1)
                                setEvaluationGrids(newGrids)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <AddCriteriaForm
                          onAdd={(criterion) => {
                            const newGrids = { ...evaluationGrids }
                            newGrids[key].criteria.push(criterion)
                            setEvaluationGrids(newGrids)
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
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
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function AddCriteriaForm({ onAdd }: { onAdd: (criterion: Criterion) => void }) {
  const [name, setName] = useState("")
  const [weight, setWeight] = useState(0.1)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = () => {
    if (name && weight > 0) {
      onAdd({ name, weight })
      setName("")
      setWeight(0.1)
      setShowForm(false)
    }
  }

  if (!showForm) {
    return (
      <Button type="button" onClick={() => setShowForm(true)}>
        Add Criteria
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Criterion Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
        step={0.1}
        min={0.1}
      />
      <Button type="button" onClick={handleAdd}>Add</Button>
      <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
    </div>
  )
}
