import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: NextRequest, { params }: { params: { stepId: string } }) {
  try {
    const { stepId } = params

    await prisma.projectStep.delete({
      where: {
        id: parseInt(stepId),
      },
    })

    return NextResponse.json({ message: "Project step deleted successfully" })
  } catch (error) {
    console.error("Error deleting project step:", error)
    return NextResponse.json({ error: "Failed to delete project step" }, { status: 500 })
  }
}
