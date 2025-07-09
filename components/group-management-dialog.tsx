"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, UserPlus, Loader2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"

interface Student {
    id: number
    email: string
    name: string
    role: string
}

interface Group {
    id: number
    name: string
    defenseTime: string
    grade: number | null
    students: Student[]
    deliverables: any[]
    reports: any[]
}

interface Project {
    id: number
    name: string
    type: string
    minStudentsPerGroup: number
    maxStudentsPerGroup: number
    groups: Group[]
}

interface GroupManagementDialogProps {
    project: Project
    currentUserGroup: Group | null
    onGroupChange: () => void
}

export function GroupManagementDialog({ project, currentUserGroup, onGroupChange }: GroupManagementDialogProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const currentUser = AuthManager.getUser()
    const canCreateGroup = project.type === "libre" && !currentUserGroup
    const canJoinGroup = !currentUserGroup

    const availableGroups = project.groups.filter(
        (group) =>
            group.students.length < project.maxStudentsPerGroup && !group.students.some((s) => s.id === currentUser?.id),
    )

    const handleCreateGroup = async () => {
        setIsCreating(true)
        setError("")
        setSuccess("")

        const response = await apiClient.createGroup({
            projectId: project.id,
        })

        if (response.error) {
            setError(response.error)
        } else {
            setSuccess("Group created successfully!")
            setTimeout(() => {
                setIsCreateDialogOpen(false)
                setSuccess("")
                onGroupChange()
            }, 1500)
        }

        setIsCreating(false)
    }

    const handleJoinGroup = async (groupId: number) => {
        if (!currentUser) return

        setIsJoining(true)
        setError("")
        setSuccess("")

        const response = await apiClient.joinGroup(groupId.toString(), [currentUser.id])

        if (response.error) {
            setError(response.error)
        } else {
            setSuccess("Successfully joined the group!")
            setTimeout(() => {
                setIsJoinDialogOpen(false)
                setSuccess("")
                onGroupChange()
            }, 1500)
        }

        setIsJoining(false)
    }

    return (
        <div className="flex gap-2">
            {/* Create Group Dialog */}
            {canCreateGroup && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Group
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Group</DialogTitle>
                            <DialogDescription>
                                Create a new group for the project "{project.name}". You'll be automatically added as a member.
                            </DialogDescription>
                        </DialogHeader>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="py-4">
                            <div className="text-sm text-slate-600">
                                <p>
                                    Group size: {project.minStudentsPerGroup}-{project.maxStudentsPerGroup} students
                                </p>
                                <p className="mt-2">
                                    A new group will be created automatically with a generated name. You can manage the group after
                                    creation.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateGroup} disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Group
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Join Group Dialog */}
            {canJoinGroup && availableGroups.length > 0 && (
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Join Group
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Join Existing Group</DialogTitle>
                            <DialogDescription>
                                Choose a group to join for the project "{project.name}". You can only join groups that haven't reached
                                their maximum capacity.
                            </DialogDescription>
                        </DialogHeader>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-200 bg-green-50">
                                <AlertDescription className="text-green-800">{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                            {availableGroups.map((group) => (
                                <Card key={group.id} className="cursor-pointer hover:bg-slate-50">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                                <CardDescription>
                                                    {group.students.length}/{project.maxStudentsPerGroup} members
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline">{group.students.length} students</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-medium mb-2 text-sm">Current Members</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(group.students ?? []).map((student) => (
                                                        <div key={student.id} className="flex items-center gap-2 bg-slate-100 rounded-md px-2 py-1">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarFallback className="text-xs">{student.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs">{student.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handleJoinGroup(group.id)}
                                                disabled={isJoining}
                                                className="w-full"
                                                size="sm"
                                            >
                                                {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Join This Group
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)} disabled={isJoining}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Information Messages */}
            {!canCreateGroup && !canJoinGroup && currentUserGroup && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You're already in a group. Leave your current group to create or join another one.
                    </AlertDescription>
                </Alert>
            )}

            {!canCreateGroup && project.type !== "libre" && !currentUserGroup && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Group creation is only available for "libre" type projects.</AlertDescription>
                </Alert>
            )}

            {canJoinGroup && availableGroups.length === 0 && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No available groups to join. All groups are at maximum capacity.</AlertDescription>
                </Alert>
            )}
        </div>
    )
}
