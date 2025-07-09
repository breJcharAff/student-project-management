import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params

    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch group: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Group fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}
