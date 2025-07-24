"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Save } from "lucide-react"

export default function EditReportPage() {
  const [activeSection, setActiveSection] = useState("introduction")
  const [content, setContent] = useState({
    introduction: "# Introduction\n\nThis project aims to create a comprehensive student project management system...",
    methodology: "# Methodology\n\nWe followed an agile development approach...",
    implementation: "# Implementation\n\nThe system was implemented using Next.js for the frontend...",
    results: "# Results\n\nThe final system successfully meets all the requirements...",
    conclusion: "# Conclusion\n\nIn conclusion, this project demonstrates...",
  })

  const handleContentChange = (section: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: value,
    }))
  }

  const handleSave = () => {

    console.log("Saving report:", content)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Report</h1>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Report
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Collaborative Editing</AlertTitle>
        <AlertDescription>Changes are automatically saved and visible to all group members.</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Select a section to edit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.keys(content).map((section) => (
                <Button
                  key={section}
                  variant={activeSection === section ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(section)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</CardTitle>
            <CardDescription>Edit the content of this section</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Tabs defaultValue="write">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <TabsList>
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      Bold
                    </Button>
                    <Button variant="ghost" size="sm">
                      Italic
                    </Button>
                    <Button variant="ghost" size="sm">
                      Link
                    </Button>
                  </div>
                </div>

                <TabsContent value="write" className="p-0">
                  <textarea
                    className="w-full min-h-[400px] p-4 font-mono text-sm resize-none focus:outline-none"
                    value={content[activeSection as keyof typeof content]}
                    onChange={(e) => handleContentChange(activeSection, e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="preview" className="p-0">
                  <div className="p-4 min-h-[400px] prose max-w-none">
                    {/* This would be rendered markdown in a real implementation */}
                    <div
                      dangerouslySetInnerHTML={{
                        __html: content[activeSection as keyof typeof content]
                          .replace(/^# (.*$)/gm, "<h1>$1</h1>")
                          .replace(/^## (.*$)/gm, "<h2>$1</h2>")
                          .replace(/\n/g, "<br />"),
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Section
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
