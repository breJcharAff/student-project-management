import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        const body = await request.json()

        console.log("Creating group with data:", body)

        const response = await fetch("http://localhost:3000/groups", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify({
                projectId: body.projectId,
            }),
        })

        console.log("Backend response status:", response.status)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.log("Backend error:", errorData)
            return NextResponse.json({ message: errorData.message || "Failed to create group" }, { status: response.status })
        }

        const data = await response.json()
        console.log("Group created successfully:", data)
        return NextResponse.json(data)
    } catch (error) {
        console.error("Group creation proxy error:", error)
        return NextResponse.json({ message: "An error occurred while creating group" }, { status: 500 })
    }
}
