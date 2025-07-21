import { NextRequest, NextResponse } from "next/server"
export async function DELETE(req: NextRequest, { params }: { params: { stepId: string } }) {
  try {
    const { stepId } = params

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/projectSteps/${stepId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to delete project step" }, { status: response.status })
    }

    return NextResponse.json({ message: "Project step deleted successfully" })
  } catch (error) {
    console.error("Error deleting project step:", error)
    return NextResponse.json({ error: "Failed to delete project step" }, { status: 500 })
  }
}
