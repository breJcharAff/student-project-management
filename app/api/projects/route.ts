import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {

        const authHeader = request.headers.get("authorization")

        // Forward the request to the backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { message: errorData.message || "Failed to fetch projects" },
                { status: response.status },
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Projects proxy error:", error)
        return NextResponse.json({ message: "An error occurred while fetching projects" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const authHeader = request.headers.get("authorization")

        // Forward the request to the actual backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { message: errorData.message || "Failed to create project" },
                { status: response.status },
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Create project proxy error:", error)
        return NextResponse.json({ message: "An error occurred while creating project" }, { status: 500 })
    }
}
