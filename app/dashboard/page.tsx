import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Clock, FileClock, Info } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // This would come from your authentication system
  const userRole = "teacher" // or "student"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {userRole === "teacher" && (
          <Button>
            <Link href="/dashboard/projects/new">Create New Project</Link>
          </Button>
        )}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Welcome to ProjectHub!</AlertTitle>
        <AlertDescription>
          {userRole === "teacher"
            ? "Manage your classes and projects from this dashboard."
            : "View your projects and submissions from this dashboard."}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Projects</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCard
              title="Web Development"
              description="Create a full-stack web application"
              deadline="May 22, 2025"
              status="In Progress"
              href="/dashboard/projects/1"
            />
            <ProjectCard
              title="Mobile App Design"
              description="Design a mobile application UI/UX"
              deadline="June 19, 2025"
              status="Not Started"
              href="/dashboard/projects/2"
            />
            <ProjectCard
              title="Database Systems"
              description="Implement a database system with queries"
              deadline="July 10, 2025"
              status="In Progress"
              href="/dashboard/projects/3"
            />
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            <DeadlineCard
              project="Web Development"
              deliverable="Frontend Prototype"
              deadline="May 22, 2025 - 23:59"
              daysLeft={7}
            />
            <DeadlineCard
              project="Mobile App Design"
              deliverable="Wireframes"
              deadline="June 19, 2025 - 23:59"
              daysLeft={14}
            />
            <DeadlineCard
              project="Database Systems"
              deliverable="Schema Design"
              deadline="July 10, 2025 - 23:59"
              daysLeft={21}
            />
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            <ActivityCard
              title="Project Created"
              description="Web Development project was created"
              timestamp="2 days ago"
            />
            <ActivityCard
              title="Deliverable Submitted"
              description="You submitted 'Requirements Document' for Mobile App Design"
              timestamp="3 days ago"
            />
            <ActivityCard
              title="Group Formed"
              description="You joined Group 3 for Database Systems"
              timestamp="1 week ago"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectCard({
  title,
  description,
  deadline,
  status,
  href,
}: {
  title: string
  description: string
  deadline: string
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
            <span className="text-slate-500">Deadline:</span>
            <span className="font-medium">{deadline}</span>
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

function DeadlineCard({
  project,
  deliverable,
  deadline,
  daysLeft,
}: {
  project: string
  deliverable: string
  deadline: string
  daysLeft: number
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${daysLeft <= 7 ? "bg-red-100" : "bg-slate-100"}`}>
            <FileClock className={`h-5 w-5 ${daysLeft <= 7 ? "text-red-500" : "text-slate-500"}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{deliverable}</h3>
            <p className="text-sm text-slate-500">{project}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm">{deadline}</span>
              <span className={`text-sm font-medium ${daysLeft <= 7 ? "text-red-500" : "text-slate-500"}`}>
                {daysLeft} days left
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityCard({
  title,
  description,
  timestamp,
}: {
  title: string
  description: string
  timestamp: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-slate-100">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
            <p className="text-xs text-slate-400 mt-1">{timestamp}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
