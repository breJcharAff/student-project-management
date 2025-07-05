import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const { groupId } = params

    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization")

    // Get the request body
    const body = await request.json()

    const response = await fetch(`http://localhost:3000/groups/${groupId}/students/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Leave group error response:", errorText)
      return NextResponse.json({ error: `Failed to leave group: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Leave group error:", error)
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 })
  }
}
