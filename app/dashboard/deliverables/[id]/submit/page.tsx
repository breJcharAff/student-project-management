"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, FileUp, GitBranch, Info, Upload } from "lucide-react"

export default function SubmitDeliverablePage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null)
  const [gitUrl, setGitUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationResults, setValidationResults] = useState<{
    passed: boolean
    checks: { name: string; passed: boolean }[]
  } | null>(null)

  const deliverable = {
    id: params.id,
    title: "Frontend Prototype",
    deadline: "May 1, 2025 - 23:59",
    description: "Submit a working prototype of the frontend interface with all required pages and components.",
    validationRules: [
      { name: "Maximum size: 50MB", description: "The archive must not exceed 50MB" },
      { name: "Contains index.html", description: "The archive must contain an index.html file" },
      { name: "Contains assets folder", description: "The archive must contain an assets folder" },
    ],
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const simulateUpload = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Simulate validation results
          setValidationResults({
            passed: true,
            checks: [
              { name: "Maximum size: 50MB", passed: true },
              { name: "Contains index.html", passed: true },
              { name: "Contains assets folder", passed: true },
            ],
          })
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      simulateUpload()
    }
  }

  const handleGitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gitUrl) {
      simulateUpload()
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Submit Deliverable</h1>
        <p className="text-slate-500 mt-1">{deliverable.title}</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Deadline</AlertTitle>
        <AlertDescription>
          This deliverable is due by {deliverable.deadline}. Late submissions may incur penalties.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{deliverable.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Validation Rules</CardTitle>
          <CardDescription>Your submission will be automatically checked against these rules</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {deliverable.validationRules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="bg-slate-100 p-1 rounded-full mt-0.5">
                  <Info className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-slate-500">{rule.description}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="file" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="git">Git Repository</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Upload Archive</CardTitle>
                <CardDescription>Upload a ZIP or TAR archive containing your project files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="file">Project Archive</Label>
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      <FileUp className="h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 mb-2">Drag and drop your file here, or click to browse</p>
                      <Input id="file" type="file" className="hidden" onChange={handleFileChange} />
                      <Button type="button" variant="outline" onClick={() => document.getElementById("file")?.click()}>
                        Browse Files
                      </Button>
                      {file && (
                        <div className="mt-4 text-sm">
                          Selected: <span className="font-medium">{file.name}</span> (
                          {(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {validationResults && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-md">
                      <div className="flex items-center gap-2">
                        {validationResults.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Info className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {validationResults.passed ? "Validation passed!" : "Validation failed"}
                        </span>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {validationResults.checks.map((check, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {check.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Info className="h-4 w-4 text-red-500" />
                            )}
                            <span className={check.passed ? "" : "text-red-500"}>{check.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={!file || uploadProgress > 0}>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Deliverable
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="git">
          <Card>
            <form onSubmit={handleGitSubmit}>
              <CardHeader>
                <CardTitle>Git Repository</CardTitle>
                <CardDescription>Provide a link to a public Git repository</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="git-url">Repository URL</Label>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-slate-500" />
                      <Input
                        id="git-url"
                        placeholder="https://github.com/username/repository"
                        value={gitUrl}
                        onChange={(e) => setGitUrl(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      Make sure your repository is public and contains all required files
                    </p>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Validating...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {validationResults && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-md">
                      <div className="flex items-center gap-2">
                        {validationResults.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Info className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {validationResults.passed ? "Validation passed!" : "Validation failed"}
                        </span>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        {validationResults.checks.map((check, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {check.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Info className="h-4 w-4 text-red-500" />
                            )}
                            <span className={check.passed ? "" : "text-red-500"}>{check.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={!gitUrl || uploadProgress > 0}>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Repository
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
