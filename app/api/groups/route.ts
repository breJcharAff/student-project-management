import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json({ message: errorData.message || "Failed to fetch groups" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Groups proxy error:", error)
        return NextResponse.json({ message: "An error occurred while fetching groups" }, { status: 500 })
    }
}
