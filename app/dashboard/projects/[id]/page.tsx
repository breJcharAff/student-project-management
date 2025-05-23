import { AvatarFallback } from "@/components/ui/avatar"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, FileText, Users } from "lucide-react"
import Link from "next/link"

export default function ProjectPage({ params }: { params: { id: string } }) {
  // This would come from your API based on the project ID
  const project = {
    id: params.id,
    title: "Web Development Project",
    description: "Create a full-stack web application with authentication, database, and responsive UI.",
    status: "In Progress",
    deadline: "May 22, 2025",
    progress: 45,
    teacher: "Prof. Smith",
    deliverables: [
      {
        id: "1",
        title: "Requirements Document",
        deadline: "April 15, 2025",
        status: "Completed",
      },
      {
        id: "2",
        title: "Frontend Prototype",
        deadline: "May 1, 2025",
        status: "In Progress",
      },
      {
        id: "3",
        title: "Backend Implementation",
        deadline: "May 15, 2025",
        status: "Not Started",
      },
      {
        id: "4",
        title: "Final Submission",
        deadline: "May 22, 2025",
        status: "Not Started",
      },
    ],
    groups: [
      {
        id: "1",
        name: "Group A",
        members: ["John Doe", "Jane Smith", "Bob Johnson"],
      },
      {
        id: "2",
        name: "Group B",
        members: ["Alice Brown", "Charlie Davis", "Eve Wilson"],
      },
    ],
  }

  // This would come from your authentication system
  const userRole = "teacher" // or "student"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge variant={project.status === "Completed" ? "default" : "outline"}>{project.status}</Badge>
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
            <CardTitle className="text-sm font-medium">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>{project.deadline}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={project.progress} />
              <div className="text-xs text-slate-500">{project.progress}% complete</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span>{project.teacher}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deliverables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="deliverables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Deliverables</h2>
            {userRole === "teacher" && (
              <Button asChild>
                <Link href={`/dashboard/projects/${project.id}/deliverables/new`}>Add Deliverable</Link>
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {project.deliverables.map((deliverable) => (
              <Card key={deliverable.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          deliverable.status === "Completed"
                            ? "bg-green-100"
                            : deliverable.status === "In Progress"
                              ? "bg-blue-100"
                              : "bg-slate-100"
                        }`}
                      >
                        <FileText
                          className={`h-5 w-5 ${
                            deliverable.status === "Completed"
                              ? "text-green-500"
                              : deliverable.status === "In Progress"
                                ? "text-blue-500"
                                : "text-slate-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{deliverable.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span className="text-sm text-slate-500">Due: {deliverable.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        deliverable.status === "Completed"
                          ? "default"
                          : deliverable.status === "In Progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {deliverable.status}
                    </Badge>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}/deliverables/${deliverable.id}`}>
                        View Details
                      </Link>
                    </Button>
                    {userRole === "student" && deliverable.status !== "Completed" && (
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/projects/${project.id}/deliverables/${deliverable.id}/submit`}>
                          Submit
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
            {project.groups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.members.length} members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {group.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{member.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{member}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Final Report</CardTitle>
              <CardDescription>Due: May 20, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="font-medium">Sections:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Introduction</li>
                    <li>Methodology</li>
                    <li>Implementation</li>
                    <li>Results</li>
                    <li>Conclusion</li>
                  </ul>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/projects/${project.id}/reports/edit`}>
                    {userRole === "student" ? "Edit Report" : "View Reports"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Presentation Schedule</h2>
            {userRole === "teacher" && (
              <Button asChild>
                <Link href={`/dashboard/projects/${project.id}/schedule/manage`}>Manage Schedule</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Final Presentations</CardTitle>
              <CardDescription>May 25-26, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Group A</div>
                        <div className="text-sm text-slate-500">May 25, 2025 - 10:00 AM</div>
                      </div>
                    </div>
                    <Badge>30 minutes</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Group B</div>
                        <div className="text-sm text-slate-500">May 25, 2025 - 10:30 AM</div>
                      </div>
                    </div>
                    <Badge>30 minutes</Badge>
                  </div>
                </div>

                <Button variant="outline" asChild>
                  <Link href={`/dashboard/projects/${project.id}/schedule/download`}>Download Schedule</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
