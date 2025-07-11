import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
    try {
        const { groupId } = await params
        const authHeader = request.headers.get("authorization")
        const body = await request.json()

        console.log(`Joining group ${groupId} with data:`, body)

        const response = await fetch(`https://pa-backend-ar8v.onrender.com/groups/${groupId}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify({
                students: body.students,
            }),
        })

        console.log("Backend response status:", response.status)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.log("Backend error:", errorData)
            return NextResponse.json({ message: errorData.message || "Failed to join group" }, { status: response.status })
        }

        const data = await response.json()
        console.log("Joined group successfully:", data)
        return NextResponse.json(data)
    } catch (error) {
        console.error("Group join proxy error:", error)
        return NextResponse.json({ message: "An error occurred while joining group" }, { status: 500 })
    }
}
