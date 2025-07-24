"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Clock,
    Users,
    Loader2,
    Info,
    CalendarDays,
    Timer,
    MapPin,
    ExternalLink,
    Bell,
    CheckCircle,
    Download,
    Move,
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { AuthManager, type User } from "@/lib/auth"
import {
    DragDropContext,
    Draggable,
    Droppable,
    type DroppableProps,
} from "react-beautiful-dnd"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
    const [enabled, setEnabled] = useState(false)
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true))
        return () => {
            cancelAnimationFrame(animation)
            setEnabled(false)
        }
    }, [])
    if (!enabled) {
        return null
    }
    return <Droppable {...props}>{children}</Droppable>
}

// Common Interfaces
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
    defenseDebutDate: string
    defenseEndDate: string
    defenseDurationInMinutes: number
    type: string
    createdBy: {
        id: number
        name: string
        email: string
    }
    groups: Group[]
}

interface Group {
    id: number
    name: string
    defenseTime: string | null
    grade: number | null
    project: Project
    students: Student[]
}

// Student View Interfaces
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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const userData = AuthManager.getUser()
        setUser(userData)
        setIsLoading(false)
    }, [])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>
                    Could not load user data. Please try logging out and back in.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Defense Schedule</h1>
                    <p className="text-slate-500 mt-1">
                        {user.role === "teacher"
                            ? "Manage and view defense schedules for your projects"
                            : "Your upcoming project defenses and presentations"}
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {user.role === "teacher" ? (
                <TeacherScheduleView user={user} setError={setError} />
            ) : (
                <StudentScheduleView user={user} setError={setError} />
            )}
        </div>
    )
}

// #region Teacher View
function TeacherScheduleView({
    user,
    setError,
}: {
    user: User
    setError: (error: string) => void
}) {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTeacherProjects = async () => {
            setIsLoading(true)
            const response = await apiClient.getProjects()
            if (response.error) {
                setError(response.error)
            } else if (response.data) {
                const teacherProjects = response.data.filter(
                    (p) => p.createdBy.id === user.id,
                )
                teacherProjects.sort((a, b) => a.id - b.id); // Sort projects by ID
                setProjects(teacherProjects)
            }
            setIsLoading(false)
        }
        fetchTeacherProjects()
    }, [user.id, setError])

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Projects Found</AlertTitle>
                <AlertDescription>
                    You have not created any projects yet.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-8">
            {projects.map((project) => (
                <ProjectScheduleCard key={project.id} project={project} />
            ))}
        </div>
    )
}

const sortGroups = (groups: Group[]) => {
    return [...groups].sort((a, b) => {
        if (a.defenseTime && b.defenseTime) {
            return new Date(a.defenseTime).getTime() - new Date(b.defenseTime).getTime()
        }
        if (a.defenseTime) return -1
        if (b.defenseTime) return 1
        return a.id - b.id // Stable sort for null defense times
    })
}

function ProjectScheduleCard({ project: initialProject }: { project: Project }) {
    const [project, setProject] = useState<Project>(initialProject)
    const [groups, setGroups] = useState<Group[]>([])
    const [originalSortedGroups, setOriginalSortedGroups] = useState<Group[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [defenseDebutDate, setDefenseDebutDate] = useState("")
    const [defenseEndDate, setDefenseEndDate] = useState("")
    const [defenseDurationInMinutes, setDefenseDurationInMinutes] = useState(0)

    useEffect(() => {
        const fetchFullProject = async () => {
            setIsLoading(true)
            const response = await apiClient.getProject(initialProject.id.toString())
            if (response.error) {
                toast.error(`Failed to load groups for ${initialProject.name}`)
            } else if (response.data) {
                setProject(response.data)
                const sorted = sortGroups(response.data.groups || [])
                setGroups(sorted)
                setOriginalSortedGroups(sorted)
            }
            setIsLoading(false)
        }
        fetchFullProject()
    }, [initialProject.id, initialProject.name])

    const handleDownloadSchedule = async () => {
        const blob = await apiClient.downloadDefenseSchedule(project.id.toString())
        if (blob) {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `defense-schedule-${project.name}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } else {
            toast.error("Failed to download schedule.")
        }
    }

    const handleDownloadAttendance = async () => {
        const blob = await apiClient.downloadAttendance(project.id.toString())
        if (blob) {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `attendance-${project.name}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } else {
            toast.error("Failed to download attendance sheet.")
        }
    }

    const onDragEnd = (result: any) => {
        if (!result.destination) return

        const items = Array.from(groups)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setGroups(items)
    }

    const handleUpdateDefenseSchedule = async () => {
        setIsUpdating(true)
        try {
            const payload: any = {}
            if (defenseDebutDate) payload.defenseDebutDate = defenseDebutDate
            if (defenseEndDate) payload.defenseEndDate = defenseEndDate
            if (defenseDurationInMinutes) payload.defenseDurationInMinutes = defenseDurationInMinutes

            const response = await apiClient.updateProject(project.id.toString(), payload)

            if (response.error) {
                toast.error(response.error)
            } else {
                toast.success("Defense schedule updated successfully!")
                const updatedProjectResponse = await apiClient.getProject(project.id.toString())
                if (updatedProjectResponse.data) {
                    setProject(updatedProjectResponse.data)
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update defense schedule.")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleValidateOrder = async () => {
        setIsUpdating(true)

        const updatesToPerform: { groupId: string; defenseTime: string | null }[] = []

        for (let i = 0; i < groups.length; i++) {
            const currentGroup = groups[i]
            const originalTimeSlot = originalSortedGroups[i].defenseTime

            if (currentGroup.defenseTime !== originalTimeSlot) {
                updatesToPerform.push({
                    groupId: currentGroup.id.toString(),
                    defenseTime: originalTimeSlot,
                })
            }
        }

        if (updatesToPerform.length === 0) {
            toast.info("No changes to save.")
            setIsUpdating(false)
            return
        }

        try {
            for (const update of updatesToPerform) {
                const response = await apiClient.updateGroupDefenseTime(
                    update.groupId,
                    update.defenseTime,
                )
                if (response.error) {
                    throw new Error(`Failed to update group. Please try again.`)
                }
            }

            const updatedProjectResponse = await apiClient.getProject(
                project.id.toString(),
            )
            if (updatedProjectResponse.data) {
                setProject(updatedProjectResponse.data)
                const sorted = sortGroups(updatedProjectResponse.data.groups || [])
                setGroups(sorted)
                setOriginalSortedGroups(sorted)
                toast.success("Group order and defense times updated successfully!")
            } else {
                throw new Error("Failed to refetch project data after update.")
            }
        } catch (error: any) {
            toast.error(error.message)
            // Revert to the state before the user started dragging
            setGroups(originalSortedGroups)
        } finally {
            setIsUpdating(false)
        }
    }

    const formatDateTime = (time: string | null) => {
        if (!time) return "To define";
        const date = new Date(time);
        if (isNaN(date.getTime())) return "To define";

        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, "0");
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes} (UTC)`;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{project.name}</CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadSchedule}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Schedule
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadAttendance}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Attendance
                        </Button>
                    </div>
                </div>
                                <CardDescription>
                    {project.description}
                    <div className="mt-2 text-sm text-muted-foreground">
                        {project.defenseDebutDate && (
                            <p>
                                <strong>Defense Start:</strong>{' '}
                                {new Date(project.defenseDebutDate).toLocaleString()}
                            </p>
                        )}
                        {project.defenseDurationInMinutes && (
                            <p>
                                <strong>Duration:</strong> {project.defenseDurationInMinutes} minutes
                            </p>
                        )}
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <StrictModeDroppable droppableId={`groups-${project.id}`}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {groups.map((group, index) => (
                                            <Draggable
                                                key={group.id}
                                                draggableId={group.id.toString()}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <Move className="h-5 w-5 text-slate-400" />
                                                            <div>
                                                                <div className="font-medium">
                                                                    {group.name}
                                                                </div>
                                                                <div className="text-sm text-slate-500">
                                                                    {group.students
                                                                        .map((s) => s.name)
                                                                        .join(", ")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-semibold">
                                                            <Clock className="h-4 w-4 inline-block mr-2" />
                                                            {formatDateTime(group.defenseTime)}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </StrictModeDroppable>
                        </DragDropContext>
                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={handleValidateOrder}
                                disabled={isUpdating || isLoading}
                            >
                                {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Validate Group Orders
                            </Button>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <h3 className="text-lg font-medium">Update Defense Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`defense-start-${project.id}`}>Start Date</Label>
                                    <Input
                                        id={`defense-start-${project.id}`}
                                        type="datetime-local"
                                        value={defenseDebutDate}
                                        onChange={(e) => setDefenseDebutDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`defense-end-${project.id}`}>End Date</Label>
                                    <Input
                                        id={`defense-end-${project.id}`}
                                        type="datetime-local"
                                        value={defenseEndDate}
                                        onChange={(e) => setDefenseEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`defense-duration-${project.id}`}>
                                        Duration (minutes)
                                    </Label>
                                    <Input
                                        id={`defense-duration-${project.id}`}
                                        type="number"
                                        value={defenseDurationInMinutes}
                                        onChange={(e) =>
                                            setDefenseDurationInMinutes(parseInt(e.target.value))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={handleUpdateDefenseSchedule}
                                    disabled={isUpdating || isLoading}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Validate Date
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
// #endregion

// #region Student View
function StudentScheduleView({
    user,
    setError,
}: {
    user: User
    setError: (error: string) => void
}) {
    const [groups, setGroups] = useState<Group[]>([])
    const [defenseEvents, setDefenseEvents] = useState<DefenseEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSchedule = async () => {
            setIsLoading(true)
            setError("")

            const response = await apiClient.getGroups()

            if (response.error) {
                setError(response.error)
            } else if (response.data && user) {
                const userGroups = response.data.filter((group: Group) =>
                    group.students.some((student) => student.id === user.id),
                )

                setGroups(userGroups)

                const events: DefenseEvent[] = userGroups
                    .filter((group) => group.defenseTime)
                    .map((group) => {
                        const startTime = new Date(group.defenseTime!)
                        const endTime = new Date(
                            startTime.getTime() +
                                group.project.defenseDurationInMinutes * 60000,
                        )

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
                            teammates: group.students.filter(
                                (student) => student.id !== user.id,
                            ),
                            isCompleted: group.grade !== null,
                            grade: group.grade,
                            type: group.project.type,
                            teacher: group.project.createdBy.name,
                        }
                    })

                events.sort(
                    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
                )
                setDefenseEvents(events)
            }

            setIsLoading(false)
        }

        if (user) {
            fetchSchedule()
        }
    }, [user, setError])

    const isUpcoming = (date: Date) => date > new Date()
    const isToday = (date: Date) =>
        date.toDateString() === new Date().toDateString()

    const upcomingEvents = defenseEvents.filter((event) =>
        isUpcoming(event.startTime),
    )
    const completedEvents = defenseEvents.filter(
        (event) => !isUpcoming(event.startTime) || event.isCompleted,
    )
    const todayEvents = defenseEvents.filter((event) =>
        isToday(event.startTime),
    )
    const thisWeekEvents = defenseEvents.filter((event) => {
        const today = new Date()
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        return event.startTime >= today && event.startTime <= weekFromNow
    })

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            {defenseEvents.length === 0 ? (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Defense Schedule</AlertTitle>
                    <AlertDescription>
                        You don&apos;t have any scheduled defenses at the moment. Check
                        back later or contact your teacher.
                    </AlertDescription>
                </Alert>
            ) : (
                <>
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Defenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {defenseEvents.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Upcoming
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {upcomingEvents.length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    This Week
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {thisWeekEvents.length}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Completed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {completedEvents.length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Today's Events */}
                    {todayEvents.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <Bell className="h-5 w-5" />
                                    Today&apos;s Defenses
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
                                                    <div className="font-medium">
                                                        {event.projectName}
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {`${event.startTime.toLocaleTimeString(
                                                            "en-US",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )} - ${event.endTime.toLocaleTimeString(
                                                            "en-US",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/dashboard/projects/${event.projectId}`}
                                                >
                                                    View Project
                                                </Link>
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
                                    <AlertDescription>
                                        You don&apos;t have any upcoming defenses
                                        scheduled.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingEvents.map((event) => (
                                        <DefenseEventCard
                                            key={event.id}
                                            event={event}
                                            isUpcoming={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="all" className="space-y-4">
                            <div className="space-y-4">
                                {defenseEvents.map((event) => (
                                    <DefenseEventCard
                                        key={event.id}
                                        event={event}
                                        isUpcoming={isUpcoming(event.startTime)}
                                    />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4">
                            {completedEvents.length === 0 ? (
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>No Completed Defenses</AlertTitle>
                                    <AlertDescription>
                                        You haven&apos;t completed any defenses yet.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    {completedEvents.map((event) => (
                                        <DefenseEventCard
                                            key={event.id}
                                            event={event}
                                            isUpcoming={false}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </>
    )
}

function DefenseEventCard({
    event,
    isUpcoming,
}: {
    event: DefenseEvent
    isUpcoming: boolean
}) {
    const getDaysUntil = (date: Date) => {
        const today = new Date()
        const diffTime = date.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const formatDate = (date: Date) =>
        date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    const formatTimeRange = (start: Date, end: Date) =>
        `${start.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })} - ${end.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })}`

    const daysUntil = getDaysUntil(event.startTime)
    const isToday = event.startTime.toDateString() === new Date().toDateString()

    return (
        <Card
            className={`${
                event.isCompleted
                    ? "bg-green-50 border-green-200"
                    : isUpcoming
                      ? "bg-blue-50 border-blue-200"
                      : "bg-slate-50"
            }`}
        >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">
                                {event.projectName}
                            </CardTitle>
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
                        <CardDescription className="text-base">
                            {event.groupName}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {event.grade && (
                            <Badge variant="default" className="bg-green-600">
                                Grade: {event.grade}/20
                            </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={`/dashboard/projects/${event.projectId}`}
                                className="flex items-center gap-1"
                            >
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
                                <div className="font-medium">
                                    {formatDate(event.startTime)}
                                </div>
                                {isUpcoming && (
                                    <div className="text-sm text-slate-500">
                                        {isToday
                                            ? "Today"
                                            : daysUntil === 1
                                              ? "Tomorrow"
                                              : `In ${daysUntil} days`}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border">
                                <Clock className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="font-medium">
                                    {formatTimeRange(event.startTime, event.endTime)}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {event.duration} minutes
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full border">
                                <MapPin className="h-4 w-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="font-medium">
                                    Teacher: {event.teacher}
                                </div>
                                <div className="text-sm text-slate-500">
                                    Defense supervisor
                                </div>
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
                                        <AvatarFallback className="bg-blue-200 text-blue-700 text-xs">
                                            You
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">You</span>
                                </div>

                                {/* Teammates */}
                                {event.teammates.map((teammate) => (
                                    <div
                                        key={teammate.id}
                                        className="flex items-center gap-2 p-2 bg-slate-100 rounded-md"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">
                                                {teammate.name.charAt(0)}
                                            </AvatarFallback>
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
                                    {isToday
                                        ? "Defense is today!"
                                        : `${daysUntil} day${
                                              daysUntil !== 1 ? "s" : ""
                                          } remaining`}
                                </span>
                            </div>
                            <Button size="sm" asChild>
                                <Link href={`/dashboard/projects/${event.projectId}`}>
                                    Prepare for Defense
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}