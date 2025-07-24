"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import MDEditor from "@uiw/react-md-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api"
import Link from "next/link";

interface ReportPart {
  id: number
  title: string
  content: string
  format: string
  createdAt: string
  updatedAt: string
}

export default function GroupReportPage() {
  const params = useParams()
  const groupId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // State for creating a new part
  const [newPartTitle, setNewPartTitle] = useState("")
  const [newPartFormat, setNewPartFormat] = useState("markdown") // Default format

  // State for existing parts
  const [reportParts, setReportParts] = useState<ReportPart[]>([])
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [selectedPartContent, setSelectedPartContent] = useState("")

  useEffect(() => {
    fetchReportParts()
  }, [groupId])

  const fetchReportParts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getReportPartsByGroup(groupId)
      if (response.error) {
        setError(response.error)
      } else {
        setReportParts(response.data || [])
        if (response.data && response.data.length > 0) {
          setSelectedPartId(response.data[0].id.toString())
          setSelectedPartContent(response.data[0].content)
        } else {
          setSelectedPartId(null)
          setSelectedPartContent("")
        }
      }
    } catch (err) {
      setError("Failed to fetch report parts.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePart = async () => {
    if (!newPartTitle.trim()) {
      setError("Please enter a title for the new part.")
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await apiClient.createReportPart(groupId, {
        title: newPartTitle,
        format: newPartFormat,
      })
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Report part created successfully!")
        setNewPartTitle("")
        await fetchReportParts() // Refresh the list of parts
      }
    } catch (err) {
      setError("Failed to create report part.")
    } finally {
      setLoading(false)
    }
  }

  const handlePartSelectionChange = (partId: string) => {
    setSelectedPartId(partId)
    const part = reportParts.find((p) => p.id.toString() === partId)
    setSelectedPartContent(part ? part.content : "")
  }

  const handleChangeContent = async () => {
    if (!selectedPartId) {
      setError("Please select a report part to update.")
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await apiClient.updateReportPart(selectedPartId, {
        content: selectedPartContent,
        format: "markdown", // Assuming markdown for now
      })
      if (response.error) {
        setError(response.error)
      } else {
        setSuccess("Report part content updated successfully!")
        await fetchReportParts() // Refresh the list of parts
      }
    } catch (err) {
      setError("Failed to update report part content.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link href={`/dashboard/groups/${groupId}`}>
          <Button variant="outline">Back to Group Details</Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold">Manage Group Report</h1>
      <p className="text-muted-foreground">Group ID: {groupId}</p>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Create New Part */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Report Part</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPartTitle">Title</Label>
            <Input
              id="newPartTitle"
              value={newPartTitle}
              onChange={(e) => setNewPartTitle(e.target.value)}
              placeholder="e.g., Introduction, Conclusion"
            />
          </div>
          <div>
            <Label htmlFor="newPartFormat">Format</Label>
            <Select value={newPartFormat} onValueChange={setNewPartFormat}>
              <SelectTrigger id="newPartFormat">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown</SelectItem>
                {/* Add other formats if needed */}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreatePart} disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              "Create Part"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Edit Existing Part */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Existing Report Part</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="selectPart">Select Part</Label>
            <Select value={selectedPartId || ""} onValueChange={handlePartSelectionChange} disabled={reportParts.length === 0 || loading}>
              <SelectTrigger id="selectPart">
                <SelectValue placeholder="Select a report part" />
              </SelectTrigger>
              <SelectContent>
                {reportParts.map((part) => (
                  <SelectItem key={part.id} value={part.id.toString()}>
                    {part.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPartId && (
            <>
              <div>
                <Label htmlFor="partContent">Content (Markdown)</Label>
                <MDEditor
                  value={selectedPartContent}
                  onChange={(val) => setSelectedPartContent(val || "")}
                  height={400}
                />
              </div>
              <Button onClick={handleChangeContent} disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  "Change Content"
                )}
              </Button>
            </>
          )}
          {reportParts.length === 0 && !loading && (
            <p className="text-muted-foreground">No report parts available. Create one above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
