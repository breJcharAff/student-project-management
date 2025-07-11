import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params

    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`https://pa-backend-ar8v.onrender.com/deliverables/group/${groupId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch deliverables: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Deliverables fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch deliverables" }, { status: 500 })
  }
}
