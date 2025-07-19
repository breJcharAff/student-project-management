import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { steps } = await req.json()
    const { projectId } = params

    const createdSteps = await prisma.projectStep.createMany({
      data: steps.map((step: any) => ({
        ...step,
        projectId: parseInt(projectId),
      })),
    })

    return NextResponse.json(createdSteps)
  } catch (error) {
    console.error("Error creating project steps:", error)
    return NextResponse.json({ error: "Failed to create project steps" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params

    const steps = await prisma.projectStep.findMany({
      where: {
        projectId: parseInt(projectId),
      },
    })

    return NextResponse.json(steps)
  } catch (error) {
    console.error("Error fetching project steps:", error)
    return NextResponse.json({ error: "Failed to fetch project steps" }, { status: 500 })
  }
}
