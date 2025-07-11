"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager, type User } from "@/lib/auth"

interface Project {
    id: number
    name: string
    description: string
    minStudentsPerGroup: number
    maxStudentsPerGroup: number
    createdById: number
}

export default function DashboardPage() {
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

            const response = await apiClient.getProjects()

            if (response.error) {
                setError(response.error)
            } else if (response.data) {
                setProjects(response.data)
            }

            setIsLoadingProjects(false)
        }

        if (user) {
            fetchProjects()
        }
    }, [user])

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
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {user.role === "teacher" && (
                    <Button>
                        <Link href="/dashboard/projects/new">Create New Project</Link>
                    </Button>
                )}
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Welcome to ProjectHub, {user.name}!</AlertTitle>
                <AlertDescription>
                    {user.role === "teacher"
                        ? "Manage your classes and projects from this dashboard."
                        : "View your projects and submissions from this dashboard."}
                </AlertDescription>
            </Alert>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Projects</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
                    <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
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
                                        title={project.name}
                                        description={project.description}
                                        groupSize={project.minStudentsPerGroup && project.maxStudentsPerGroup ? `${project.minStudentsPerGroup}-${project.maxStudentsPerGroup} students` : 'N/A'}
                                        status="Active"
                                        href={`/dashboard/projects/${project.id}`}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    <div className="grid gap-4">
                        <div className="text-center py-8 text-slate-500">No upcoming deadlines at the moment.</div>
                    </div>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                    <div className="grid gap-4">
                        <div className="text-center py-8 text-slate-500">No recent activity to display.</div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function ProjectCard({
                         title,
                         description,
                         groupSize,
                         status,
                         href,
                     }: {
    title: string
    description: string
    groupSize: string
    status: string
    href: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Group Size:</span>
                        <span className="font-medium">{groupSize}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-medium">{status}</span>
                    </div>
                    <Button variant="outline" className="mt-2 w-full" asChild>
                        <Link href={href}>View Project</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
