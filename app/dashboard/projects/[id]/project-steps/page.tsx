"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ProjectStepsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [step, setStep] = useState({
    title: "",
    description: "",
    deadline: new Date(),
    maxDeliverableSizeInMb: 0,
    allowedAfterDeadline: false,
    penaltyPerDay: 0,
    rules: [],
  })

  const handleStepChange = (field, value) => {
    setStep({ ...step, [field]: value })
  }

  const handleRuleChange = (ruleIndex, field, value) => {
    const newRules = [...step.rules]
    newRules[ruleIndex][field] = value
    setStep({ ...step, rules: newRules })
  }

  const handleAddRule = () => {
    setStep({ ...step, rules: [...step.rules, { type: "requiredFile", value: "" }] })
  }

  const handleRemoveRule = (ruleIndex) => {
    const newRules = [...step.rules]
    newRules.splice(ruleIndex, 1)
    setStep({ ...step, rules: newRules })
  }

  const handleSubmit = async () => {
    try {
      await apiClient.createProjectSteps(params.id, { steps: [step] })
      toast.success("Project step created successfully!")
      router.push(`/dashboard/projects/${params.id}`)
    } catch (error) {
      toast.error("Failed to create project step.")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Project Step</h1>

      <div className="p-4 border rounded-md space-y-4">
          <h2 className="text-xl font-semibold">Step 1</h2>
          <div>
            <Label htmlFor={`title`}>Title</Label>
            <Input
              id={`title`}
              value={step.title}
              onChange={(e) => handleStepChange("title", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`description`}>Description</Label>
            <Textarea
              id={`description`}
              value={step.description}
              onChange={(e) =>
                handleStepChange("description", e.target.value)
              }
            />
          </div>
          <div>
            <Label htmlFor={`deadline`}>Deadline</Label>
            <div className="w-auto">
              <Calendar
                mode="single"
                selected={step.deadline}
                onSelect={(date) => handleStepChange("deadline", date)}
                className="rounded-md border"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`max-size`}>
              Maximum size archive (in MB)
            </Label>
            <Input
              id={`max-size`}
              type="number"
              value={step.maxDeliverableSizeInMb}
              onChange={(e) =>
                handleStepChange(
                  "maxDeliverableSizeInMb",
                  parseInt(e.target.value)
                )
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id={`allow-after-deadline`}
              checked={step.allowedAfterDeadline}
              onCheckedChange={(checked) =>
                handleStepChange("allowedAfterDeadline", checked)
              }
            />
            <Label htmlFor={`allow-after-deadline`}>
              Allow upload after deadline
            </Label>
          </div>
          {step.allowedAfterDeadline && (
            <div>
              <Label htmlFor={`penalty`}>Penalty per day</Label>
              <Input
                id={`penalty`}
                type="number"
                value={step.penaltyPerDay}
                onChange={(e) =>
                  handleStepChange(
                    "penaltyPerDay",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          )}

          <h3 className="text-lg font-semibold">Rules</h3>
          {step.rules.map((rule, ruleIndex) => (
            <div key={ruleIndex} className="flex items-center space-x-2">
              <Select
                value={rule.type}
                onValueChange={(value) =>
                  handleRuleChange(ruleIndex, "type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requiredFile">
                    Required File (e.g., README.md)
                  </SelectItem>
                  <SelectItem value="requiredFolder">
                    Required Folder (e.g., src)
                  </SelectItem>
                  <SelectItem value="contentCheck">
                    Content Check (e.g., regex:^# .*Introduction)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={rule.value}
                onChange={(e) =>
                  handleRuleChange(ruleIndex, "value", e.target.value)
                }
                placeholder="Rule Value"
              />
              {rule.type === "contentCheck" && (
                <Input
                  value={rule.targetFilename}
                  onChange={(e) =>
                    handleRuleChange(
                      ruleIndex,
                      "targetFilename",
                      e.target.value
                    )
                  }
                  placeholder="Target Filename (e.g., README.md)"
                />
              )}
              <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveRule(ruleIndex)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}<Button onClick={() => handleAddRule()} variant="outline">
            Add Rule
          </Button>
        </div>
      <Button onClick={handleSubmit}>Create Project Step</Button>
    </div>
  )
}
