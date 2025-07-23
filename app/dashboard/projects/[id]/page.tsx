"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Loader2,
  Calendar,
  Clock,
  FileText,
  Download,
  GraduationCap,
  Target,
  Award,
  Settings,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { GroupManagementDialog } from "@/components/group-management-dialog"

interface Student {
  id: number
  email: string
  name: string
  role: string
}

interface Deliverable {
  id: number
  filename: string
  submittedAt: string
  comment: string | null
}

interface Group {
  id: number
  name: string
  defenseTime: string
  grade: number | null
  students: Student[]
  deliverables: Deliverable[]
  reports: any[]
}

interface Criteria {
  id: number
  name: string
  weight: number
  target: "deliverable" | "defense" | "report"
}

interface Promotion {
  id: number
  name: string
  students: Student[]
}

interface CreatedBy {
  id: number
  email: string
  name: string
  role: string
}

interface Project {
  id: number
  name: string
  description: string
  minStudentsPerGroup: number
  maxStudentsPerGroup: number
  defenseDebutDate: string
  defenseDurationInMinutes: number
  subjectFilename: string | null
  type: string
  isGroupBased: boolean
  evaluationType: string
  createdBy: CreatedBy
  groups: Group[]
  promotions: Promotion[]
  steps: any[]
}

interface ProjectPageClientProps {
  projectId: string
}

interface EvaluationGrid {
  id: number
  target: string
  criteria: Criteria[]
}

function ProjectPageClient({ projectId }: ProjectPageClientProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [projectSteps, setProjectSteps] = useState<any[]>([])
  const [evaluationGrids, setEvaluationGrids] = useState<EvaluationGrid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
      const user = AuthManager.getUser()
      if (user) {
        setUserRole(user.role)
        setCurrentUser(user)
      }
    }, [])

    const fetchProject = async () => {
      setIsLoading(true)
      setError("")

      try {
        const projectResponse = await apiClient.getProject(projectId)

        if (projectResponse.error) {
          setError(projectResponse.error)
          setProject(null) // Ensure project is null on error
        } else if (projectResponse.data) {
          let updatedProject = projectResponse.data

          // If the project has groups, fetch one to get min/max students per group
          if (updatedProject.groups && updatedProject.groups.length > 0) {
            const firstGroupId = updatedProject.groups[0].id.toString()
            const groupResponse = await apiClient.getGroup(firstGroupId)
            if (!groupResponse.error && groupResponse.data && groupResponse.data.project) {
              updatedProject = {
                ...updatedProject,
                minStudentsPerGroup: groupResponse.data.project.minStudentsPerGroup,
                maxStudentsPerGroup: groupResponse.data.project.maxStudentsPerGroup,
              }
            }

            // Extract criteria from evaluationGrids within groups
            const projectCriteria = updatedProject.groups.flatMap((group: any) =>
              (group.evaluationGrids || []).flatMap((grid: any) => grid.criteria || [])
            )
            updatedProject = { ...updatedProject, criteria: projectCriteria }
          }

          // Fetch full promotion data to get student lists
          if (updatedProject.promotions && updatedProject.promotions.length > 0) {
            const promotionPromises = updatedProject.promotions.map((promo: Promotion) =>
              apiClient.getPromotion(promo.id.toString())
            );
            const promotionResponses = await Promise.all(promotionPromises);
            const updatedPromotions = promotionResponses.map(res => res.data).filter(Boolean);
            updatedProject = { ...updatedProject, promotions: updatedPromotions };
          }

          setProject(updatedProject)
        }
      } catch (e: any) {
        console.error("Error in fetchProject:", e)
        setError(e.message || "An unexpected error occurred.")
        setProject(null)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchProjectSteps = async () => {
      try {
        const response = await apiClient.getProjectSteps(projectId)
        if (response.data) {
          setProjectSteps(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch project steps", error)
      }
    }

    const fetchEvaluationGrids = async () => {
      try {
        const response = await apiClient.getEvaluationGridsByProject(projectId)
        if (response.data) {
          setEvaluationGrids(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch evaluation grids", error)
      }
    }

    useEffect(() => {
      fetchProject()
      fetchProjectSteps()
      fetchEvaluationGrids()
    }, [projectId])

    if (isLoading) {
      return (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin"/>
          </div>
      )
    }

    if (error) {
      return (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
      )
    }

    if (!project) {
      return (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-slate-500 mb-4">Project not found</p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
      )
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

    const handleDeleteStep = async (stepId: string) => {
      try {
        await apiClient.deleteProjectStep(stepId)
        fetchProjectSteps()
      } catch (error) {
        console.error("Failed to delete project step", error)
      }
    }

    const formatTime = (dateString?: string) => {
      if (!dateString) return "N/A"
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const handleDownload = async (deliverable: Deliverable) => {
      try {
        const blob = await apiClient.downloadDeliverable(deliverable.id.toString());
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = deliverable.filename || 'deliverable.zip';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          setError("Download failed");
        }
      } catch (err) {
        setError("Download failed");
      }
    };

    const getCriteriaByTarget = (target: string) => {
      const grid = evaluationGrids.find((g) => g.target?.toLowerCase() === target.toLowerCase())
      return grid ? grid.criteria : []
    }

    const getTotalStudents = () => {
      return (project.groups ?? []).reduce((total, group) => total + (group.students?.length ?? 0), 0)
    }

    const getCompletedDeliverables = () => {
      return (project.groups ?? []).reduce((total, group) => total + (group.deliverables?.length ?? 0), 0)
    }

    const isUserInGroup = (group: Group) => {
      return currentUser && (group.students ?? []).some((student) => student.id === currentUser.id)
    }

    const getCurrentUserGroup = () => {
      return (project.groups ?? []).find((group) => isUserInGroup(group)) || null
    }

    const currentUserGroup = getCurrentUserGroup()

    return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge variant="outline" className="capitalize">
                  {project.type}
                </Badge>
                <Badge variant={project.isGroupBased ? "default" : "secondary"}>
                  {project.isGroupBased ? "Group Project" : "Individual Project"}
                </Badge>
              </div>
              <p className="text-slate-500 mb-2">{project.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4"/>
              Created by {project.createdBy?.name ?? "?"}
            </span>
                <span className="flex items-center gap-1">
              <Target className="h-4 w-4"/>
                  {project.evaluationType ?? "N/A"} evaluation
            </span>
              </div>
            </div>

            {userRole === "teacher" && (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/projects/${project.id}/edit`}>Edit Project</Link>
                  </Button>
                  <Button>
                    <Link href={`/dashboard/projects/${project.id}/grade`}>Grade Project</Link>
                  </Button>
                </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Defense Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500"/>
                  <div>
                    <div className="font-medium">{formatDate(project.defenseDebutDate)}</div>
                    <div className="text-sm text-slate-500">{project.defenseDurationInMinutes ?? "??"} minutes each
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Group Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500"/>
                  <span>
                    {project.minStudentsPerGroup && project.maxStudentsPerGroup ? `${project.minStudentsPerGroup}-${project.maxStudentsPerGroup} students` : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{(project.groups ?? []).length}</span>
                  <span className="text-slate-500">groups formed</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{getTotalStudents()}</span>
                  <span className="text-slate-500">total students</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="steps" className="space-y-4">
            <TabsList>
              <TabsTrigger value="steps">Project Steps</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="criteria">Evaluation Criteria</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
              <TabsTrigger value="schedule">Defense Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Project Steps</h2>
                {userRole === "teacher" && (
                  <Button asChild>
                    <Link href={`/dashboard/projects/${project.id}/project-steps`}>Create New Project Step</Link>
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                {projectSteps.map((step) => (
                  <Card key={step.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{step.title}</CardTitle>
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                        {userRole === "teacher" && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteStep(step.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>Deadline: {formatDate(step.deadline)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Groups</h2>
                <div className="flex gap-2">
                  {userRole === "student" && (
                      <GroupManagementDialog
                          project={project}
                          currentUserGroup={currentUserGroup}
                          onGroupChange={fetchProject}
                      />
                  )}
                  {userRole === "teacher" && (
                      <Button asChild>
                        <Link href={`/dashboard/projects/${project.id}/groups/manage`}>Manage Groups</Link>
                      </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                {(project.groups ?? []).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No groups have been formed yet.</div>
                ) : (
                    (project.groups ?? []).map((group) => (
                        <Card key={group.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {group.name}
                                  {/* PATCH ROBUSTESSE NOTE */}
                                  {group.grade !== null && group.grade !== undefined ? (
                                      <Badge variant="default" className="flex items-center gap-1">
                                        <Award className="h-3 w-3"/>
                                        {group.grade}/20
                                      </Badge>
                                  ) : (
                                      <Badge variant="secondary">Not graded</Badge>
                                  )}
                                  {isUserInGroup(group) && (
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                        Your Group
                                      </Badge>
                                  )}
                                </CardTitle>

                                <CardDescription>Defense: {formatDate(group.defenseTime)}</CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{group.students?.length ?? 0} students</Badge>
                                {isUserInGroup(group) && (
                                    <Button asChild size="sm" variant="outline">
                                      <Link href={`/dashboard/groups/${group.id}`} className="flex items-center gap-1">
                                        <Settings className="h-3 w-3"/>
                                        Manage
                                      </Link>
                                    </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Students */}
                              <div>
                                <h4 className="font-medium mb-2">Students</h4>
                                <div className="flex flex-wrap gap-2">
                                  {(group.students ?? []).map((student) => (
                                      <div
                                          key={student.id}
                                          className={`flex items-center gap-2 rounded-md px-2 py-1 ${
                                              currentUser && student.id === currentUser.id
                                                  ? "bg-blue-50 border border-blue-200"
                                                  : "bg-slate-50"
                                          }`}
                                      >
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-xs">{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">
                                {student.name}
                                          {currentUser && student.id === currentUser.id && " (You)"}
                              </span>
                                      </div>
                                  ))}
                                </div>
                              </div>

                              {/* PATCH DELIVERABLES */}
                              {Array.isArray(group.deliverables) && group.deliverables.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Deliverables</h4>
                                    <div className="space-y-2">
                                      {group.deliverables.map((deliverable) => (
                                          <div
                                              key={deliverable.id}
                                              className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                                          >
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-4 w-4 text-slate-500"/>
                                              <div>
                                                <div className="font-medium text-sm">{deliverable.filename ?? "No title"}</div>
                                                <div className="text-xs text-slate-500">
                                                  Uploaded {formatDate(deliverable.submittedAt)}
                                                </div>
                                                {deliverable.comment && (
                                                    <div className="text-xs text-slate-600 mt-1">{deliverable.comment}</div>
                                                )}
                                              </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(deliverable)}>
                                              <Download className="h-4 w-4"/>
                                            </Button>
                                          </div>
                                      ))}
                                    </div>
                                  </div>
                              )}

                              {/* PATCH REPORTS */}
                              {Array.isArray(group.reports) && group.reports.length > 0 && (
                                  <div>
                                    <h4 className="font-medium mb-2">Reports</h4>
                                    <div className="text-sm text-slate-500">{group.reports.length} report(s) submitted
                                    </div>
                                  </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                    ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Evaluation Criteria</h2>
                {userRole === "teacher" && (
                    <Button asChild>
                      <Link href={`/dashboard/projects/${project.id}/criteria/manage`}>Manage Criteria</Link>
                    </Button>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Deliverable Criteria */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5"/>
                      Deliverable Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getCriteriaByTarget("deliverable").map((criteria) => (
                          <div key={criteria.id} className="flex justify-between items-center">
                            <span className="text-sm">{criteria.name ?? "unnamed criteria"}</span>
                            <Badge variant="outline">Weight: {criteria.weight ?? 0}</Badge>
                          </div>
                      ))}
                      {getCriteriaByTarget("deliverable").length === 0 && (
                          <div className="text-sm text-slate-500">No deliverable criteria defined</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Defense Criteria */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5"/>
                      Defense Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getCriteriaByTarget("defense").map((criteria) => (
                          <div key={criteria.id} className="flex justify-between items-center">
                            <span className="text-sm">{criteria.name ?? "unnamed criteria"}</span>
                            <Badge variant="outline">Weight: {criteria.weight ?? 0}</Badge>
                          </div>
                      ))}
                      {getCriteriaByTarget("defense").length === 0 && (
                          <div className="text-sm text-slate-500">No defense criteria defined</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Report Criteria */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5"/>
                      Report Criteria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getCriteriaByTarget("report").map((criteria) => (
                          <div key={criteria.id} className="flex justify-between items-center">
                            <span className="text-sm">{criteria.name ?? "unnamed criteria"}</span>
                            <Badge variant="outline">Weight: {criteria.weight ?? 0}</Badge>
                          </div>
                      ))}
                      {getCriteriaByTarget("report").length === 0 && (
                          <div className="text-sm text-slate-500">No report criteria defined</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="promotions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Promotions</h2>
                {userRole === "teacher" && (
                    <Button asChild>
                      <Link href={`/dashboard/projects/${project.id}/promotions/manage`}>Manage Promotions</Link>
                    </Button>
                )}
              </div>

              <div className="grid gap-4">
                {(project.promotions ?? []).map((promotion) => (
                    <Card key={promotion.id}>
                      <CardHeader>
                        <CardTitle>{promotion.name}</CardTitle>
                        <CardDescription>{promotion.students ? promotion.students.length : 0} students</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                          {(promotion.students ?? []).map((student) => (
                              <div key={student.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{student.name}</div>
                                  <div className="text-xs text-slate-500">{student.email}</div>
                                </div>
                              </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Defense Schedule</h2>
                {userRole === "teacher" && (
                    <Button asChild>
                      <Link href={`/dashboard/schedule`}>Manage Schedule</Link>
                    </Button>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Defense Sessions</CardTitle>
                  <CardDescription>
                    {formatDate(project.defenseDebutDate)} - {project.defenseDurationInMinutes} minutes per group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(project.groups ?? [])
                        .sort((a, b) => new Date(a.defenseTime).getTime() - new Date(b.defenseTime).getTime())
                        .map((group) => (
                            <div key={group.id}
                                 className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                              <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full border">
                                  <Clock className="h-4 w-4 text-slate-500"/>
                                </div>
                                <div>
                                  <div className="font-medium">{group.name}</div>
                                  <div
                                      className="text-sm text-slate-500">{(group.students ?? []).map((s) => s.name).join(", ")}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatTime(group.defenseTime)}</div>
                                <div className="text-sm text-slate-500">{project.defenseDurationInMinutes} min</div>
                              </div>
                            </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    )
  }

  export default function ProjectPage({params}: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    return <ProjectPageClient projectId={resolvedParams.id}/>
  }
