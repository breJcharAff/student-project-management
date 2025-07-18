"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Loader2, Calendar, Clock, Users as UsersIcon, Tag } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager, type User } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"

interface Project {
    id: number
    name: string
    description: string
    minStudentsPerGroup?: number
    maxStudentsPerGroup?: number
    createdById: number
    groups?: Array<{
        id: number
        name: string
    }>
    defenseDebutDate?: string
    defenseDurationInMinutes?: number
    type?: string
    isGroupBased?: boolean
    promotions?: Array<{ id: number; name: string }>
}

export default function ProjectsListPage() {
    const [user, setUser] = useState<User | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoadingProjects, setIsLoadingProjects] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const userData = AuthManager.getUser()
        setUser(userData)
    }, [])

    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoadingProjects(true)
            setError("")

            try {
                const response = await apiClient.getProjects()

                if (response.error) {
                    setError(response.error)
                } else if (response.data) {
                    const projectsWithGroupSize = await Promise.all(
                        response.data.map(async (project: Project) => {
                            let projectToProcess = project

                            // If groups are not directly available, fetch full project details
                            if (!project.groups || project.groups.length === 0) {
                                const fullProjectResponse = await apiClient.getProject(project.id.toString())
                                if (!fullProjectResponse.error && fullProjectResponse.data) {
                                    projectToProcess = fullProjectResponse.data
                                } else if (fullProjectResponse.error) {
                                    console.error("Failed to fetch full project details for", project.id, ":", fullProjectResponse.error)
                                }
                            }

                            if (projectToProcess.isGroupBased && projectToProcess.groups && projectToProcess.groups.length > 0) {
                                const groupResponse = await apiClient.getGroup(projectToProcess.groups[0].id.toString())
                                if (!groupResponse.error && groupResponse.data && groupResponse.data.project) {
                                    return {
                                        ...projectToProcess,
                                        minStudentsPerGroup: groupResponse.data.project.minStudentsPerGroup,
                                        maxStudentsPerGroup: groupResponse.data.project.maxStudentsPerGroup,
                                    }
                                }
                            }
                            return projectToProcess
                        }),
                    )
                    setProjects(projectsWithGroupSize)
                }
            } catch (e: any) {
                console.error("Error in fetchProjects:", e)
                setError(e.message || "An unexpected error occurred.")
            } finally {
                setIsLoadingProjects(false)
            }
        }

        if (user) {
            fetchProjects()
        }
    }, [user])

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

    if (!user) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">All Projects</h1>
                {user.role === "teacher" && (
                    <Button>
                        <Link href="/dashboard/projects/new">Create New Project</Link>
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoadingProjects ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-slate-500">
                            No projects found. {user.role === "teacher" && "Create your first project to get started!"}
                        </div>
                    ) : (
                        projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                formatDate={formatDate}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function ProjectCard({
                         project,
                     }: {
    project: Project
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Group Size:</span>
                        <span className="font-medium">
                            {project.minStudentsPerGroup && project.maxStudentsPerGroup
                                ? `${project.minStudentsPerGroup}-${project.maxStudentsPerGroup} students`
                                : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Promotions:</span>
                        <span className="font-medium">
                            {project.promotions && project.promotions.length > 0
                                ? project.promotions.map(p => p.name).join(', ')
                                : 'N/A'}
                        </span>
                    </div>
                    <Button variant="outline" className="mt-2 w-full" asChild>
                        <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
