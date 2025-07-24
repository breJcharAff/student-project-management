"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api"
import { Loader2, Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import Papa from "papaparse"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface CsvStudent {
  email: string
  name: string
}

interface CreationStatus {
    success: boolean;
    name: string;
    email: string;
    isNew: boolean;
}

export default function AddStudentPage() {
  const params = useParams()
  const router = useRouter()
  const promotionId = params.id as string
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [students, setStudents] = useState<User[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<CsvStudent[]>([])
  const [creationStatus, setCreationStatus] = useState<CreationStatus[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const response = await apiClient.getUsers()
      if (response.data) {
        setStudents(response.data.filter((user) => user.role === "student"))
      }
      setIsLoading(false)
    }
    fetchUsers()
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ";",
        complete: (results) => {
          setCsvData(results.data as CsvStudent[])
          setCreationStatus([]) // Clear previous status
        },
      })
    }
  }

  const handleValidateCsvData = async () => {
    setIsLoading(true)
    setError(null)
    let newStudentIds: number[] = []
    let statuses: CreationStatus[] = []

    for (const csvStudent of csvData) {
      const existingStudent = students.find(s => s.email === csvStudent.email)
      if (existingStudent) {
        newStudentIds.push(existingStudent.id)
        statuses.push({ success: true, name: csvStudent.name, email: csvStudent.email, isNew: false })
      } else {
        // Attempt to register new student
        const response = await apiClient.register(csvStudent.email, csvStudent.name, "password", "student")
        if (response.data?.user) {
          newStudentIds.push(response.data.user.id)
          statuses.push({ success: true, name: csvStudent.name, email: csvStudent.email, isNew: true })
        } else {
          statuses.push({ success: false, name: csvStudent.name, email: csvStudent.email, isNew: false })
        }
      }
    }
    setCreationStatus(statuses)
    setSelectedStudents((prev) => [...new Set([...prev, ...newStudentIds])])
    setIsLoading(false)
  }

  const handleAddStudents = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.addStudentsToPromotion(promotionId, selectedStudents)
      if (response.error) {
        setError(response.error)
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Students added to the promotion.",
        })
        router.push(`/dashboard/promotions/${promotionId}`)
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add students."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add Students</h1>
          <p className="text-muted-foreground">
            Select students to add to the promotion or upload a CSV file.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back to Promotion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Selection</CardTitle>
          <CardDescription>
            Choose from the list of available students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="h-8 w-8 animate-spin" />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => toggleStudentSelection(student.id)}
                />
                <label
                  htmlFor={`student-${student.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {student.name} ({student.email})
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with 'email' and 'name' columns, separated by semicolons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>

          {csvData.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">CSV Data Preview</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button onClick={handleValidateCsvData} className="mt-4" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Validate CSV Data
              </Button>
            </div>
          )}

            {creationStatus.filter(status => status.success && status.isNew).length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Account created</h3>
                    <div className="space-y-2">
                        {creationStatus.filter(status => status.success && status.isNew).map((status, index) => (
                            <div key={index} className="flex items-center text-sm text-green-600">
                                ✅ 
                                <span className="ml-2">{status.name} ({status.email})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {creationStatus.filter(status => !status.success).length > 0 && (
                <div className="mt-4 space-y-2">
                    {creationStatus.filter(status => !status.success).map((status, index) => (
                        <div key={index} className="flex items-center text-sm text-red-600">
                            ❌ 
                            <span className="ml-2">{status.name} ({status.email})</span>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleAddStudents} disabled={isLoading || selectedStudents.length === 0}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add {selectedStudents.length} Student(s)
      </Button>
    </div>
  )
}