"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"

interface Project {
  id: number
  name: string
  description: string
  minStudentsPerGroup: number
  maxStudentsPerGroup: number
  createdById: number
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUserRole(parsedUser.role)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true)
      setError("")

      const response = await apiClient.getProject(params.id)

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setProject(response.data)
      }

      setIsLoading(false)
    }

    const fetchGroups = async () => {
      const response = await apiClient.getGroups()

      if (response.data) {
        // Filter groups for this project
        const projectGroups = response.data.filter((group: any) => group.projectId === Number.parseInt(params.id))
        setGroups(projectGroups)
      }
    }

    fetchProject()
    fetchGroups()
  }, [params.id])

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
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

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="outline">Active</Badge>
            </div>
            <p className="text-slate-500 mt-1">{project.description}</p>
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

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Group Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span>
                {project.minStudentsPerGroup}-{project.maxStudentsPerGroup} students
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
                <span className="text-2xl font-bold">{groups.length}</span>
                <span className="text-slate-500">groups formed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>Active</Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Groups</h2>
              {userRole === "teacher" && (
                  <Button asChild>
                    <Link href={`/dashboard/projects/${project.id}/groups/manage`}>Manage Groups</Link>
                  </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {groups.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">No groups have been formed yet.</div>
              ) : (
                  groups.map((group) => (
                      <Card key={group.id}>
                        <CardHeader>
                          <CardTitle>{group.name}</CardTitle>
                          <CardDescription>Group ID: {group.id}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-slate-500">Project: {project.name}</div>
                        </CardContent>
                      </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Deliverables</h2>
              {userRole === "teacher" && (
                  <Button asChild>
                    <Link href={`/dashboard/projects/${project.id}/deliverables/new`}>Add Deliverable</Link>
                  </Button>
              )}
            </div>

            <div className="text-center py-8 text-slate-500">No deliverables configured yet.</div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Reports</h2>
              {userRole === "teacher" && (
                  <Button asChild>
                    <Link href={`/dashboard/projects/${project.id}/reports/configure`}>Configure Reports</Link>
                  </Button>
              )}
            </div>

            <div className="text-center py-8 text-slate-500">No reports configured yet.</div>
          </TabsContent>

          <TabsContent value="evaluations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Evaluations</h2>
              {userRole === "teacher" && (
                  <Button asChild>
                    <Link href={`/dashboard/projects/${project.id}/evaluations/create`}>Create Evaluation</Link>
                  </Button>
              )}
            </div>

            <div className="text-center py-8 text-slate-500">No evaluations available yet.</div>
          </TabsContent>
        </Tabs>
      </div>
  )
}
