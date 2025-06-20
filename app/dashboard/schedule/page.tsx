"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Loader2, Info, CalendarDays, Timer, MapPin, ExternalLink, Bell, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager, type User } from "@/lib/auth"

interface Student {
    id: number
    email: string
    name: string
    role: string
}

interface Project {
    id: number
    name: string
    description: string
    defenseDurationInMinutes: number
    type: string
    createdBy: {
        id: number
        name: string
        email: string
    }
}

interface Group {
    id: number
    name: string
    defenseTime: string
    grade: number | null
    project: Project
    students: Student[]
}

interface DefenseEvent {
    id: string
    title: string
    projectName: string
    projectId: number
    groupName: string
    groupId: number
    startTime: Date
    endTime: Date
    duration: number
    teammates: Student[]
    isCompleted: boolean
    grade: number | null
    type: string
    teacher: string
}

export default function SchedulePage() {
    const [user, setUser] = useState<User | null>(null)
    const [groups, setGroups] = useState<Group[]>([])
    const [defenseEvents, setDefenseEvents] = useState<DefenseEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const userData = AuthManager.getUser()
        setUser(userData)
    }, [])

    useEffect(() => {
        const fetchSchedule = async () => {
            setIsLoading(true)
            setError("")

            const response = await apiClient.getGroups()

            if (response.error) {
                setError(response.error)
            } else if (response.data && user) {
                // Filter groups where the current user is a member
                const userGroups = response.data.filter((group: Group) =>
                    group.students.some((student) => student.id === user.id),
                )

                setGroups(userGroups)

                // Transform groups into defense events
                const events: DefenseEvent[] = userGroups.map((group) => {
                    const startTime = new Date(group.defenseTime)
                    const endTime = new Date(startTime.getTime() + group.project.defenseDurationInMinutes * 60000)

                    return {
                        id: `defense-${group.id}`,
                        title: `${group.project.name} - ${group.name}`,
                        projectName: group.project.name,
                        projectId: group.project.id,
                        groupName: group.name,
                        groupId: group.id,
                        startTime,
                        endTime,
                        duration: group.project.defenseDurationInMinutes,
                        teammates: group.students.filter((student) => student.id !== user.id),
                        isCompleted: group.grade !== null,
                        grade: group.grade,
                        type: group.project.type,
                        teacher: group.project.createdBy.name,
                    }
                })

                // Sort events by date
                events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                setDefenseEvents(events)
            }

            setIsLoading(false)
        }

        if (user) {
            fetchSchedule()
        }
    }, [user])

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatTimeRange = (start: Date, end: Date) => {
        return `${formatTime(start)} - ${formatTime(end)}`
    }

    const isUpcoming = (date: Date) => {
        return date > new Date()
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isThisWeek = (date: Date) => {
        const today = new Date()
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        return date >= today && date <= weekFromNow
    }

    const getDaysUntil = (date: Date) => {
        const today = new Date()
        const diffTime = date.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const upcomingEvents = defenseEvents.filter((event) => isUpcoming(event.startTime))
    const completedEvents = defenseEvents.filter((event) => !isUpcoming(event.startTime) || event.isCompleted)
    const todayEvents = defenseEvents.filter((event) => isToday(event.startTime))
    const thisWeekEvents = defenseEvents.filter((event) => isThisWeek(event.startTime))

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
                    <h1 className="text-3xl font-bold">Defense Schedule</h1>
                    <p className="text-slate-500 mt-1">Your upcoming project defenses and presentations</p>
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
                    {defenseEvents.length === 0 ? (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>No Defense Schedule</AlertTitle>
                            <AlertDescription>
                                You don't have any scheduled defenses at the moment. Check back later or contact your teacher.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {/* Quick Stats */}
                            <div className="grid gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Total Defenses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{defenseEvents.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-600">{thisWeekEvents.length}</div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">{completedEvents.length}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Today's Events */}
                            {todayEvents.length > 0 && (
                                <Card className="border-orange-200 bg-orange-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-orange-800">
                                            <Bell className="h-5 w-5" />
                                            Today's Defenses
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {todayEvents.map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-orange-100 p-2 rounded-full">
                                                            <Clock className="h-4 w-4 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{event.projectName}</div>
                                                            <div className="text-sm text-slate-500">
                                                                {formatTimeRange(event.startTime, event.endTime)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" asChild>
                                                        <Link href={`/dashboard/projects/${event.projectId}`}>View Project</Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Tabs defaultValue="upcoming" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                    <TabsTrigger value="all">All Events</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                </TabsList>

                                <TabsContent value="upcoming" className="space-y-4">
                                    {upcomingEvents.length === 0 ? (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>No Upcoming Defenses</AlertTitle>
                                            <AlertDescription>You don't have any upcoming defenses scheduled.</AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="space-y-4">
                                            {upcomingEvents.map((event) => (
                                                <DefenseEventCard key={event.id} event={event} isUpcoming={true} />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="all" className="space-y-4">
                                    <div className="space-y-4">
                                        {defenseEvents.map((event) => (
                                            <DefenseEventCard key={event.id} event={event} isUpcoming={isUpcoming(event.startTime)} />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="completed" className="space-y-4">
                                    {completedEvents.length === 0 ? (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>No Completed Defenses</AlertTitle>
                                            <AlertDescription>You haven't completed any defenses yet.</AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="space-y-4">
                                            {completedEvents.map((event) => (
                                                <DefenseEventCard key={event.id} event={event} isUpcoming={false} />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

function DefenseEventCard({ event, isUpcoming }: { event: DefenseEvent; isUpcoming: boolean }) {
    const getDaysUntil = (date: Date) => {
        const today = new Date()
        const diffTime = date.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatTimeRange = (start: Date, end: Date) => {
        return `${formatTime(start)} - ${formatTime(end)}`
    }

    const daysUntil = getDaysUntil(event.startTime)
    const isToday = event.startTime.toDateString() === new Date().toDateString()

    return (
        <Card
            className={`${event.isCompleted ? "bg-green-50 border-green-200" : isUpcoming ? "bg-blue-50 border-blue-200" : "bg-slate-50"}`}
        >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{event.projectName}</CardTitle>
                            <Badge variant="outline" className="capitalize">
                                {event.type}
                            </Badge>
                            {event.isCompleted && (
                                <Badge variant="default" className="bg-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                </Badge>
                            )}
                            {isToday && (
                                <Badge variant="default" className="bg-orange-600">
                                    <Bell className="h-3 w-3 mr-1" />
                                    Today
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-base">{event.groupName}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {event.grade && (
                            <Badge variant="default" className="bg-green-600">
                                Grade: {event.grade}/20
                            </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/projects/${event.projectId}`} className="flex items-center gap-1">
                                View Project
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Date and Time Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border">
                                <CalendarDays className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="font-medium">{formatDate(event.startTime)}</div>
                                {isUpcoming && (
                                    <div className="text-sm text-slate-500">
                                        {isToday ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border">
                                <Clock className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="font-medium">{formatTimeRange(event.startTime, event.endTime)}</div>
                                <div className="text-sm text-slate-500">{event.duration} minutes</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border">
                                <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="font-medium">Teacher: {event.teacher}</div>
                                <div className="text-sm text-slate-500">Defense supervisor</div>
                            </div>
                        </div>
                    </div>

                    {/* Team Information */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Your Team ({event.teammates.length + 1} members)
                            </h4>
                            <div className="space-y-2">
                                {/* Current User */}
                                <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-md">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-200 text-blue-700 text-xs">You</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">You</span>
                                </div>

                                {/* Teammates */}
                                {event.teammates.map((teammate) => (
                                    <div key={teammate.id} className="flex items-center gap-2 p-2 bg-slate-100 rounded-md">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{teammate.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{teammate.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Countdown for upcoming events */}
                {isUpcoming && !event.isCompleted && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">
                  {isToday ? "Defense is today!" : `${daysUntil} day${daysUntil !== 1 ? "s" : ""} remaining`}
                </span>
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/dashboard/projects/${event.projectId}`}>Prepare for Defense</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
