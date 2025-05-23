"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Save } from "lucide-react"

export default function GradeProjectPage({ params }: { params: { id: string } }) {
  const [activeGroup, setActiveGroup] = useState("1")
  const [grades, setGrades] = useState({
    "1": {
      deliverables: {
        requirements: 85,
        frontend: 90,
        backend: 0,
        final: 0,
      },
      report: {
        content: 0,
        structure: 0,
        clarity: 0,
      },
      presentation: {
        delivery: 0,
        slides: 0,
        qa: 0,
      },
      comments: "",
    },
    "2": {
      deliverables: {
        requirements: 80,
        frontend: 85,
        backend: 0,
        final: 0,
      },
      report: {
        content: 0,
        structure: 0,
        clarity: 0,
      },
      presentation: {
        delivery: 0,
        slides: 0,
        qa: 0,
      },
      comments: "",
    },
  })

  // This would come from your API based on the project ID
  const project = {
    id: params.id,
    title: "Web Development Project",
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

  const handleGradeChange = (groupId: string, category: string, criterion: string, value: number) => {
    setGrades((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId as keyof typeof prev],
        [category]: {
          ...prev[groupId as keyof typeof prev][category as keyof (typeof prev)[typeof groupId]],
          [criterion]: value,
        },
      },
    }))
  }

  const handleCommentsChange = (groupId: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId as keyof typeof prev],
        comments: value,
      },
    }))
  }

  const calculateAverage = (groupId: string, category: string) => {
    const categoryGrades = grades[groupId as keyof typeof grades][category as keyof (typeof grades)[typeof groupId]]
    const values = Object.values(categoryGrades) as number[]
    const sum = values.reduce((acc, val) => acc + val, 0)
    return values.length > 0 ? sum / values.length : 0
  }

  const calculateFinalGrade = (groupId: string) => {
    const deliverablesAvg = calculateAverage(groupId, "deliverables")
    const reportAvg = calculateAverage(groupId, "report")
    const presentationAvg = calculateAverage(groupId, "presentation")

    // Weighted average: 50% deliverables, 30% report, 20% presentation
    return deliverablesAvg * 0.5 + reportAvg * 0.3 + presentationAvg * 0.2
  }

  const handleSave = () => {
    // Save logic would go here
    console.log("Saving grades:", grades)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grade Project</h1>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Grades
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">{project.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Select a group to grade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {project.groups.map((group) => (
                <Button
                  key={group.id}
                  variant={activeGroup === group.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveGroup(group.id)}
                >
                  {group.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{project.groups.find((g) => g.id === activeGroup)?.name} Grading</CardTitle>
            <CardDescription>Grade each criterion and provide feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deliverables" className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="presentation">Presentation</TabsTrigger>
              </TabsList>

              <TabsContent value="deliverables" className="space-y-4">
                <GradingCriterion
                  label="Requirements Document"
                  value={grades[activeGroup as keyof typeof grades].deliverables.requirements}
                  onChange={(value) => handleGradeChange(activeGroup, "deliverables", "requirements", value)}
                />

                <GradingCriterion
                  label="Frontend Prototype"
                  value={grades[activeGroup as keyof typeof grades].deliverables.frontend}
                  onChange={(value) => handleGradeChange(activeGroup, "deliverables", "frontend", value)}
                />

                <GradingCriterion
                  label="Backend Implementation"
                  value={grades[activeGroup as keyof typeof grades].deliverables.backend}
                  onChange={(value) => handleGradeChange(activeGroup, "deliverables", "backend", value)}
                />

                <GradingCriterion
                  label="Final Submission"
                  value={grades[activeGroup as keyof typeof grades].deliverables.final}
                  onChange={(value) => handleGradeChange(activeGroup, "deliverables", "final", value)}
                />

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Deliverables Average:</span>
                    <span className="text-lg font-bold">
                      {calculateAverage(activeGroup, "deliverables").toFixed(1)}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="report" className="space-y-4">
                <GradingCriterion
                  label="Content Quality"
                  value={grades[activeGroup as keyof typeof grades].report.content}
                  onChange={(value) => handleGradeChange(activeGroup, "report", "content", value)}
                />

                <GradingCriterion
                  label="Structure and Organization"
                  value={grades[activeGroup as keyof typeof grades].report.structure}
                  onChange={(value) => handleGradeChange(activeGroup, "report", "structure", value)}
                />

                <GradingCriterion
                  label="Clarity and Writing"
                  value={grades[activeGroup as keyof typeof grades].report.clarity}
                  onChange={(value) => handleGradeChange(activeGroup, "report", "clarity", value)}
                />

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Report Average:</span>
                    <span className="text-lg font-bold">{calculateAverage(activeGroup, "report").toFixed(1)}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="presentation" className="space-y-4">
                <GradingCriterion
                  label="Delivery and Communication"
                  value={grades[activeGroup as keyof typeof grades].presentation.delivery}
                  onChange={(value) => handleGradeChange(activeGroup, "presentation", "delivery", value)}
                />

                <GradingCriterion
                  label="Slides and Visual Aids"
                  value={grades[activeGroup as keyof typeof grades].presentation.slides}
                  onChange={(value) => handleGradeChange(activeGroup, "presentation", "slides", value)}
                />

                <GradingCriterion
                  label="Q&A Responses"
                  value={grades[activeGroup as keyof typeof grades].presentation.qa}
                  onChange={(value) => handleGradeChange(activeGroup, "presentation", "qa", value)}
                />

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Presentation Average:</span>
                    <span className="text-lg font-bold">
                      {calculateAverage(activeGroup, "presentation").toFixed(1)}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Final Grade:</span>
                <span className="text-2xl font-bold">{calculateFinalGrade(activeGroup).toFixed(1)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments and Feedback</Label>
                <Textarea
                  id="comments"
                  placeholder="Provide feedback for the group..."
                  value={grades[activeGroup as keyof typeof grades].comments}
                  onChange={(e) => handleCommentsChange(activeGroup, e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Grades
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function GradingCriterion({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number.parseInt(e.target.value))}
            className="w-16 text-right"
          />
          <span className="text-sm text-slate-500">/100</span>
        </div>
      </div>
      <Slider value={[value]} min={0} max={100} step={1} onValueChange={(values) => onChange(values[0])} />
      <div className="flex justify-between text-xs text-slate-500">
        <span>Poor</span>
        <span>Average</span>
        <span>Excellent</span>
      </div>
    </div>
  )
}
