"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Users, Loader2, Calendar, Clock, ExternalLink, Info, Award, GraduationCap, Settings } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager, type User } from "@/lib/auth"

interface Student {
    id: number
    email: string
    name: string
    passwordHash: string
    role: string
    grade: number | null
}

interface CreatedBy {
    id: number
    email: string
    name: string
    passwordHash: string
    role: string
    grade: number | null
}

interface Project {
    id: number
    name: string
    description: string
    minStudentsPerGroup: number
    maxStudentsPerGroup: number
    defenseDate: string
    defenseDurationInMinutes: number
    subjectFilename: string | null
    type: string
    isGroupBased: boolean
    createdBy: CreatedBy
}

interface Group {
    id: number
    name: string
    defenseTime: string
    grade: number | null
    project: Project
    students: Student[]
}

export default function GroupsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [allGroups, setAllGroups] = useState<Group[]>([])
    const [userGroups, setUserGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const userData = AuthManager.getUser()
        setUser(userData)
    }, [])

    useEffect(() => {
        const fetchGroups = async () => {
            setIsLoading(true)
            setError("")

            const response = await apiClient.getGroups()

            if (response.error) {
                setError(response.error)
            } else if (response.data) {
                setAllGroups(response.data)

                // Filter groups where the current user is a member
                if (user) {
                    const filteredGroups = response.data.filter((group: Group) =>
                        group.students.some((student) => student.id === user.id),
                    )
                    setUserGroups(filteredGroups)
                }
            }

            setIsLoading(false)
        }

        if (user) {
            fetchGroups()
        }
    }, [user])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getOtherStudents = (group: Group) => {
        return group.students.filter((student) => student.id !== user?.id)
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
                <div>
                    <h1 className="text-3xl font-bold">My Groups</h1>
                    <p className="text-slate-500 mt-1">Projects and groups you're participating in</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    {userGroups.length === 0 ? (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>No Groups Found</AlertTitle>
                            <AlertDescription>
                                You are not currently assigned to any project groups. Contact your teacher if you believe this is an
                                error.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="grid gap-6">
                                {userGroups.map((group) => (
                                    <Card key={group.id} className="overflow-hidden">
                                        <CardHeader className="bg-slate-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <CardTitle className="text-xl">{group.project.name}</CardTitle>
                                                        <Badge variant="outline" className="capitalize">
                                                            {group.project.type}
                                                        </Badge>
                                                        {group.grade !== null && group.grade !== undefined ? (
                                                            <Badge variant="default" className="flex items-center gap-1">
                                                                <Award className="h-3 w-3" />
                                                                {group.grade}/20
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Not graded</Badge>
                                                        )}

                                                    </div>
                                                    <CardDescription className="text-base mb-3">{group.project.description}</CardDescription>
                                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4" />
                                {group.project.createdBy.name}
                            </span>
                                                        <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                                                            {group.project.minStudentsPerGroup}-{group.project.maxStudentsPerGroup} students per group
                            </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button asChild variant="outline">
                                                        <Link href={`/dashboard/groups/${group.id}`} className="flex items-center gap-2">
                                                            <Settings className="h-4 w-4" />
                                                            Manage Group
                                                        </Link>
                                                    </Button>
                                                    <Button asChild>
                                                        <Link href={`/dashboard/projects/${group.project.id}`} className="flex items-center gap-2">
                                                            View Project
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                {/* Group Information */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                            <Users className="h-5 w-5" />
                                                            {group.name}
                                                        </h3>

                                                        <div className="space-y-3">
                                                            {/* Current User */}
                                                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                        {user.name.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{user.name} (You)</div>
                                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                                </div>
                                                                <Badge variant="secondary">Me</Badge>
                                                            </div>

                                                            {/* Other Group Members */}
                                                            {getOtherStudents(group).map((student) => (
                                                                <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1">
                                                                        <div className="font-medium">{student.name}</div>
                                                                        <div className="text-sm text-slate-500">{student.email}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Defense Information */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                            <Calendar className="h-5 w-5" />
                                                            Defense Schedule
                                                        </h3>

                                                        <div className="space-y-3">
                                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Clock className="h-4 w-4 text-slate-500" />
                                                                    <span className="font-medium">Defense Date</span>
                                                                </div>
                                                                <div className="text-lg font-semibold">{formatDate(group.project.defenseDate)}</div>
                                                            </div>

                                                            <div className="p-4 bg-slate-50 rounded-lg">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Clock className="h-4 w-4 text-slate-500" />
                                                                    <span className="font-medium">Your Group's Time</span>
                                                                </div>
                                                                <div className="text-lg font-semibold">{formatTime(group.defenseTime)}</div>
                                                                <div className="text-sm text-slate-500 mt-1">
                                                                    Duration: {group.project.defenseDurationInMinutes} minutes
                                                                </div>
                                                            </div>

                                                            {group.grade && (
                                                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Award className="h-4 w-4 text-green-600" />
                                                                        <span className="font-medium text-green-800">Final Grade</span>
                                                                    </div>
                                                                    <div className="text-2xl font-bold text-green-700">{group.grade}/20</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Summary Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{userGroups.length}</div>
                                            <div className="text-sm text-slate-500">Active Groups</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {userGroups.filter((g) => g.grade !== null).length}
                                            </div>
                                            <div className="text-sm text-slate-500">Graded Projects</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {userGroups.filter((g) => g.grade === null).length}
                                            </div>
                                            <div className="text-sm text-slate-500">Pending Evaluation</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
