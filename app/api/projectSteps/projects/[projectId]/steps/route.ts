import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { steps } = await req.json()
    const { projectId } = params

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projectSteps/projects/${projectId}/steps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(steps),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to create project steps" }, { status: response.status })
    }

    const createdSteps = await response.json()
    return NextResponse.json(createdSteps)
  } catch (error) {
    console.error("Error creating project steps:", error)
    return NextResponse.json({ error: "Failed to create project steps" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projectSteps/projects/${projectId}/steps`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to fetch project steps" }, { status: response.status })
    }

    const steps = await response.json()
    return NextResponse.json(steps)
  } catch (error) {
    console.error("Error fetching project steps:", error)
    return NextResponse.json({ error: "Failed to fetch project steps" }, { status: 500 })
  }
}
