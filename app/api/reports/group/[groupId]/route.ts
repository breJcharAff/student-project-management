import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const mockReportParts = [
  {
    id: 1,
    title: "Conclusion",
    content: "This is the conclusion of the report.",
    format: "markdown",
    createdAt: "2025-07-16T17:23:54.455Z",
    updatedAt: "2025-07-16T17:23:54.455Z",
    groupId: "1", // Mock groupId
  },
  {
    id: 2,
    title: "Introduction",
    content: "This is the introduction of the report.",
    format: "markdown",
    createdAt: "2025-07-16T17:24:11.960Z",
    updatedAt: "2025-07-16T17:24:11.960Z",
    groupId: "1", // Mock groupId
  },
  {
    id: 3,
    title: "Methodology",
    content: "This section describes the methodology used.",
    format: "markdown",
    createdAt: "2025-07-16T17:25:00.000Z",
    updatedAt: "2025-07-16T17:25:00.000Z",
    groupId: "2", // Mock groupId
  },
]

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  try {
    const { groupId } = params

    const partsForGroup = mockReportParts.filter((part) => part.groupId === groupId)

    return NextResponse.json(partsForGroup, { status: 200 })
  } catch (error) {
    console.error("Error fetching report parts:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}