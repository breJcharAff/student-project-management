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
import {error} from "next/dist/build/output/log";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const userData = AuthManager.getUser()
        setUser(userData)
    }, [])

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
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Welcome to Dropject, {user.name}!</AlertTitle>
                <AlertDescription>
                    {user.role === "teacher"
                        ? "Manage your classes and projects from this dashboard."
                        : "View your projects and submissions from this dashboard."}
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Overview</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
                    <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome</CardTitle>
                            <CardDescription>Your dashboard overview.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>Explore your projects, groups, and schedule.</p>
                            <Button asChild className="mt-4">
                                <Link href="/dashboard/projects">View All Projects</Link>
                            </Button>
                        </CardContent>
                    </Card>
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