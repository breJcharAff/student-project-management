"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Download,
  Users,
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogOut,
  Award
} from "lucide-react"
import { AuthManager } from "@/lib/auth"
import { apiClient } from "@/lib/api"

interface Group {
  id: number
  name: string
  defenseTime: string
  grade: number | null
  project: {
    id: number
    name: string
    description: string
    minStudentsPerGroup: number
    maxStudentsPerGroup: number
    defenseDate: string
    defenseDurationInMinutes: number
    type: string
    isGroupBased: boolean
    createdBy: {
      id: number
      name: string
      email: string
      role: string
    }
  } | null
  students: Array<{
    id: number
    name: string
    email: string
    role: string
  }> | null
  deliverables?: Deliverable[]
}
interface Deliverable {
  id: number
  filename?: string
  title?: string
  comment?: string
  path?: string
  uploadedAt?: string
  submittedAt?: string // backend format
  [key: string]: any
}

export default function GroupManagePage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadComment, setUploadComment] = useState("")

  const currentUser = AuthManager.getUser()

  // === UNIQUE EFFECT, PAS DE BOUCLE ===
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setGroup(null)
    setDeliverables([])

    const fetchAll = async () => {
      // 1. Fetch group pour avoir le projectId
      const groupResponse = await apiClient.getGroup(groupId)
      if (groupResponse.error || !groupResponse.data) {
        if (!cancelled) {
          setError(groupResponse.error || "Failed to fetch group data")
          setLoading(false)
        }
        return
      }
      if (!cancelled) setGroup(groupResponse.data)

      const projId = groupResponse.data?.project?.id
      if (!projId) {
        if (!cancelled) {
          setError("No project associated with this group")
          setDeliverables([])
          setLoading(false)
        }
        return
      }

      // 2. Fetch projet complet pour les livrables du groupe
      const projectResponse = await apiClient.getProject(projId)
      if (projectResponse.error || !projectResponse.data) {
        if (!cancelled) {
          setError(projectResponse.error || "Failed to fetch project data")
          setDeliverables([])
          setLoading(false)
        }
        return
      }
      const foundGroup = (projectResponse.data.groups ?? []).find(
          (g: any) => g.id.toString() === groupId.toString()
      )
      if (!foundGroup) {
        if (!cancelled) {
          setError("Groupe introuvable dans ce projet")
          setDeliverables([])
          setLoading(false)
        }
        return
      }
      const groupDeliverables = (foundGroup.deliverables ?? []).map((d: any) => ({
        ...d,
        uploadedAt: d.uploadedAt || d.submittedAt,
        title: d.title || d.filename || `Livrable #${d.id}`,
      }))
      if (!cancelled) {
        setDeliverables(groupDeliverables)
        setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [groupId])

  // === UPLOAD LOGIC ================
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !uploadTitle.trim()) {
      setError("Please select a file and enter a title")
      return
    }
    if (!uploadFile.name.toLowerCase().endsWith(".zip")) {
      setError("Only ZIP files are allowed")
      return
    }
    setUploading(true)
    setError(null)
    setSuccess(null)
    try {
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("title", uploadTitle.trim())
      formData.append("comment", uploadComment.trim())
      const response = await apiClient.uploadDeliverable(groupId, formData)
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Deliverable uploaded successfully!")
        setUploadFile(null)
        setUploadTitle("")
        setUploadComment("")
        // Refresh deliverables
        // ==> Relancer le fetch complet (ci-dessous, même séquence qu'au mount)
        setLoading(true)
        setError(null)
        const groupResponse = await apiClient.getGroup(groupId)
        if (!groupResponse.error && groupResponse.data?.project?.id) {
          const projId = groupResponse.data.project.id
          const projectResponse = await apiClient.getProject(projId)
          const foundGroup = (projectResponse.data.groups ?? []).find(
              (g: any) => g.id.toString() === groupId.toString()
          )
          const groupDeliverables = (foundGroup?.deliverables ?? []).map((d: any) => ({
            ...d,
            uploadedAt: d.uploadedAt || d.submittedAt,
            title: d.title || d.filename || `Livrable #${d.id}`,
          }))
          setDeliverables(groupDeliverables)
        }
        setLoading(false)
      }
    } catch (err) {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (deliverable: Deliverable) => {
    try {
      const blob = await apiClient.downloadDeliverable(deliverable.id.toString())
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = deliverable.title || "deliverable.zip"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError("Download failed")
      }
    } catch (err) {
      setError("Download failed")
    }
  }

  const handleLeaveGroup = async () => {
    if (!currentUser || !confirm("Are you sure you want to leave this group? This action cannot be undone.")) {
      return
    }
    try {
      const response = await apiClient.leaveGroup(groupId)
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Successfully left the group")
        setTimeout(() => {
          router.push("/dashboard/groups")
        }, 2000)
      }
    } catch (err) {
      setError("Failed to leave group")
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (!group) {
    return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The group you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/dashboard/groups")}>Back to Groups</Button>
        </div>
    )
  }

  const safeStudents = group.students ?? []
  const isUserInGroup = safeStudents.some((student) => student.id === currentUser?.id)

  if (!isUserInGroup) {
    return (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You are not a member of this group.</p>
          <Button onClick={() => router.push("/dashboard/groups")}>Back to Groups</Button>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{group.name || "Unnamed Group"}</h1>
            <p className="text-muted-foreground">Manage your group and deliverables</p>
          </div>
          <Button
              variant="outline"
              onClick={() =>
                  router.push(
                      group.project?.id
                          ? `/dashboard/projects/${group.project.id}`
                          : "/dashboard/projects"
                  )
              }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Project
          </Button>
        </div>

        {/* Alerts */}
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

        {/* Project Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {group.project?.name ?? "No project"}
            </CardTitle>
            <CardDescription>{group.project?.description ?? "No description"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Defense Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(group.defenseTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {group.project?.defenseDurationInMinutes ?? "??"} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Group Size</p>
                  <p className="text-sm text-muted-foreground">
                    {safeStudents.length} / {group.project?.maxStudentsPerGroup ?? "??"} students
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {group.grade !== null && group.grade !== undefined ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {group.grade}/20
                  </Badge>
              ) : (
                  <Badge variant="secondary">Not graded</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Group Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Members ({safeStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeStudents.map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback>
                        {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {student.name}
                        {student.id === currentUser?.id && (
                            <Badge variant="outline" className="ml-2">
                              You
                            </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Deliverable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Deliverable
            </CardTitle>
            <CardDescription>Upload a ZIP file containing your project deliverable</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">File (ZIP only)</Label>
                <Input
                    id="file"
                    type="file"
                    accept=".zip"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    required
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter deliverable title"
                    required
                />
              </div>
              <div>
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                    id="comment"
                    value={uploadComment}
                    onChange={(e) => setUploadComment(e.target.value)}
                    placeholder="Add any comments about this deliverable"
                    rows={3}
                />
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Deliverable
                    </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Deliverables List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Deliverables ({deliverables.length})
            </CardTitle>
            <CardDescription>All deliverables uploaded by your group</CardDescription>
          </CardHeader>
          <CardContent>
            {deliverables.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No deliverables uploaded yet</p>
            ) : (
                <div className="space-y-4">
                  {deliverables.map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{deliverable.title ?? deliverable.filename ?? "No title"}</h4>
                          {deliverable.comment && <p className="text-sm text-muted-foreground mt-1">{deliverable.comment}</p>}
                          <p className="text-xs text-muted-foreground mt-2">
                            Uploaded on {formatDate(deliverable.uploadedAt ?? deliverable.submittedAt)}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(deliverable)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for this group</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLeaveGroup}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Group
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Once you leave this group, you cannot rejoin unless added by a teacher.
            </p>
          </CardContent>
        </Card>
      </div>
  )
}
