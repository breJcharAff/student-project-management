"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Users, AlertTriangle, CheckCircle, X } from "lucide-react"
import { apiClient } from "@/lib/api"
import { MultiSelect } from "@/components/ui/multi-select"
import { Label } from "@/components/ui/label"

interface Student {
  id: number
  name: string
  email: string
}

interface Group {
  id: number
  name: string
  students: Student[]
}

interface Project {
  id: number
  name: string
  minStudentsPerGroup: number
  maxStudentsPerGroup: number
  groups: Group[]
  promotions: Array<{ id: number; name: string }>
}

export default function ManageGroupsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string // Changed from params.projectId

  const [project, setProject] = useState<Project | null>(null)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pendingGroupChanges, setPendingGroupChanges] = useState<{[groupId: number]: Student[]}>({}) // New state for pending changes

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const projectResponse = await apiClient.getProject(projectId)
      if (projectResponse.error) {
        setError(projectResponse.error)
        setIsLoading(false)
        return
      }
      const fetchedProject = projectResponse.data
      setProject(fetchedProject)

      // Initialize pendingGroupChanges with current students
      const initialPendingChanges: {[groupId: number]: Student[]} = {}
      fetchedProject.groups.forEach((group: Group) => {
        initialPendingChanges[group.id] = [...group.students]
      })
      setPendingGroupChanges(initialPendingChanges)

      // Fetch all students from associated promotions
      const studentPromises = fetchedProject.promotions.map(async (promo: { id: number }) => {
        const studentsResponse = await apiClient.getStudentsByPromotion(promo.id.toString())
        if (studentsResponse.error) {
          console.error("Failed to fetch students for promotion", promo.id, ":", studentsResponse.error)
          return []
        }
        return studentsResponse.data || []
      })
      const studentsByPromotion = await Promise.all(studentPromises)
      const uniqueStudents = Array.from(new Map(studentsByPromotion.flat().map((student: Student) => [student.id, student])).values())
      setAllStudents(uniqueStudents)

    } catch (err: any) {
      setError(err.message || "Failed to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [projectId])

  const handleAddStudentsToGroup = (groupId: number, selectedStudentIds: number[]) => {
    setPendingGroupChanges(prev => {
      const currentStudentsInGroup = prev[groupId] || []
      const studentsToAdd = selectedStudentIds.filter(id => !currentStudentsInGroup.some(s => s.id === id))
      const newStudents = [...currentStudentsInGroup, ...studentsToAdd.map(id => allStudents.find(s => s.id === id)!)]

      // Frontend validation for max students
      const maxStudents = project?.maxStudentsPerGroup || Infinity
      if (newStudents.length > maxStudents) {
        setError(`Cannot add students. Group size would exceed maximum of ${maxStudents}.`)
        return prev // Don't update state if validation fails
      }

      return {
        ...prev,
        [groupId]: newStudents,
      }
    })
  }

  const handleRemoveStudentsFromGroup = (groupId: number, studentIdToRemove: number) => {
    setPendingGroupChanges(prev => {
      const currentStudentsInGroup = prev[groupId] || []
      const newStudents = currentStudentsInGroup.filter(s => s.id !== studentIdToRemove)

      // Frontend validation for min students
      const minStudents = project?.minStudentsPerGroup || 0
      if (newStudents.length < minStudents) {
        setError(`Cannot remove students. Group size would fall below minimum of ${minStudents}.`)
        return prev // Don't update state if validation fails
      }

      return {
        ...prev,
        [groupId]: newStudents,
      }
    })
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      for (const groupId in pendingGroupChanges) {
        const currentStudents = project?.groups.find(g => g.id === parseInt(groupId))?.students || []
        const newStudents = pendingGroupChanges[groupId]

        const studentsToAdd = newStudents.filter(s => !currentStudents.some(cs => cs.id === s.id))
        const studentsToRemove = currentStudents.filter(cs => !newStudents.some(s => s.id === cs.id))

        if (studentsToAdd.length > 0) {
          const response = await apiClient.joinGroup(groupId, studentsToAdd.map(s => s.id))
          if (response.error) {
            throw new Error(response.error)
          }
        }

        if (studentsToRemove.length > 0) {
          const response = await apiClient.leaveGroup(groupId, studentsToRemove.map(s => s.id))
          if (response.error) {
            throw new Error(response.error)
          }
        }
      }
      setSuccess("Group changes saved successfully!")
      await fetchData() // Re-fetch data to update UI with confirmed changes
    } catch (err: any) {
      setError(err.message || "Failed to save changes.")
    } finally {
      setIsSaving(false)
    }
  }

  // Check if there are any pending changes to enable/disable save button
  const hasPendingChanges = Object.keys(pendingGroupChanges).some(groupId => {
    const currentStudents = project?.groups.find(g => g.id === parseInt(groupId))?.students || []
    const newStudents = pendingGroupChanges[parseInt(groupId)] || []
    return currentStudents.length !== newStudents.length ||
           currentStudents.some(s => !newStudents.some(ns => ns.id === s.id)) ||
           newStudents.some(ns => !currentStudents.some(s => s.id === ns.id))
  })

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

  const availableStudents = allStudents.filter(student =>
    !Object.values(pendingGroupChanges).flat().some(s => s.id === student.id)
  )

  const sortedGroups = [...project.groups].sort((a, b) => {
    const aNum = parseInt(a.name.replace(/\D/g, ''), 10)
    const bNum = parseInt(b.name.replace(/\D/g, ''), 10)
    return aNum - bNum
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Groups for {project.name}</h1>
          <p className="text-muted-foreground">Add or remove students from project groups.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/dashboard/projects/${projectId}`)} variant="outline">
            Back to Project
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving || !hasPendingChanges}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
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
          <CardTitle>Project Group Configuration</CardTitle>
          <CardDescription>
            Min Students: {project.minStudentsPerGroup} | Max Students: {project.maxStudentsPerGroup}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.groups.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No groups found for this project.</p>
          ) : (
            <div className="space-y-6">
              {sortedGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {group.name} ({pendingGroupChanges[group.id]?.length || 0} students)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Current Members:</h3>
                      {pendingGroupChanges[group.id]?.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No students in this group.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {pendingGroupChanges[group.id]?.map((student) => (
                            <Badge key={student.id} variant="secondary">
                              {student.name}
                              <X
                                className="ml-1 h-3 w-3 cursor-pointer"
                                onClick={() => handleRemoveStudentsFromGroup(group.id, student.id)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`add-students-${group.id}`}>Add Students:</Label>
                      <MultiSelect
                        options={availableStudents.map((s) => ({ label: s.name, value: s.id }))}
                        selected={pendingGroupChanges[group.id]?.map(s => s.id) || []}
                        onSelectedChange={(selectedIds) => handleAddStudentsToGroup(group.id, selectedIds)}
                        placeholder="Select students to add..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
