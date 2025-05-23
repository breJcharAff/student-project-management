"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import {
  DragDropContext as ActualDragDropContext,
  Draggable as ActualDraggable,
  Droppable as ActualDroppable,
} from "react-beautiful-dnd"
import { CalendarIcon, Clock, Download, Printer, Users } from "lucide-react"

export default function ManageSchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [duration, setDuration] = useState(30)

  // Mock groups data
  const [groups, setGroups] = useState([
    { id: "1", name: "Group A", members: ["John Doe", "Jane Smith", "Bob Johnson"] },
    { id: "2", name: "Group B", members: ["Alice Brown", "Charlie Davis", "Eve Wilson"] },
    { id: "3", name: "Group C", members: ["Frank Miller", "Grace Lee", "Henry Taylor"] },
    { id: "4", name: "Group D", members: ["Ivy Chen", "Jack Robinson", "Kate White"] },
  ])

  // Mock schedule data
  const [schedule, setSchedule] = useState([
    { id: "1", groupId: "1", time: "09:00", duration: 30 },
    { id: "2", groupId: "2", time: "09:30", duration: 30 },
    { id: "3", groupId: "3", time: "10:00", duration: 30 },
    { id: "4", groupId: "4", time: "10:30", duration: 30 },
  ])

  const handleDragEnd = (result: any) => {
    // In a real implementation, this would reorder the schedule
    console.log("Drag ended:", result)
  }

  const generateSchedule = () => {
    // In a real implementation, this would generate a schedule based on the inputs
    console.log("Generating schedule with:", { date, startTime, endTime, duration })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Presentation Schedule</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Schedule
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Schedule</TabsTrigger>
          <TabsTrigger value="arrange">Arrange Order</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Parameters</CardTitle>
              <CardDescription>Set the date, time, and duration for presentations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Presentation Date</Label>
                    <div className="mt-2">
                      <Calendar mode="single" selected={date} onSelect={setDate} className="border rounded-md" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration per Group (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                    />
                  </div>

                  <Button className="mt-4" onClick={generateSchedule}>
                    Generate Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arrange" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arrange Presentation Order</CardTitle>
              <CardDescription>Drag and drop to rearrange the order of presentations</CardDescription>
            </CardHeader>
            <CardContent>
              <ActualDragDropContext onDragEnd={handleDragEnd}>
                <ActualDroppable droppableId="schedule">
                  {(provided: any) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {schedule.map((item, index) => {
                        const group = groups.find((g) => g.id === item.groupId)
                        return (
                          <ActualDraggable key={item.id} draggableId={item.id} index={index}>
                            {(provided: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center justify-between p-4 bg-white border rounded-md shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="bg-slate-100 p-2 rounded-full">
                                    <Users className="h-5 w-5 text-slate-500" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{group?.name}</div>
                                    <div className="text-sm text-slate-500">{group?.members.join(", ")}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {item.time}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium">{item.duration} min</div>
                                </div>
                              </div>
                            )}
                          </ActualDraggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </ActualDroppable>
              </ActualDragDropContext>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Order</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Preview</CardTitle>
              <CardDescription>Preview the final presentation schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-slate-500" />
                  <span className="font-medium">
                    {date?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <Separator />

                <div className="space-y-4">
                  {schedule.map((item) => {
                    const group = groups.find((g) => g.id === item.groupId)
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full border">
                            <Users className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <div className="font-medium">{group?.name}</div>
                            <div className="text-sm text-slate-500">{group?.members.join(", ")}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {item.time} - {calculateEndTime(item.time, item.duration)}
                            </div>
                          </div>
                          <div className="text-sm font-medium">{item.duration} min</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Edit Schedule</Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to calculate end time
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMinutes = totalMinutes % 60
  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`
}
