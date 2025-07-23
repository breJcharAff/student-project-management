import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authHeader = request.headers.get("authorization")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${(await params).id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json({ message: errorData.message || "Failed to fetch project" }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Project fetch proxy error:", error)
        return NextResponse.json({ message: "An error occurred while fetching project" }, { status: 500 })
    }
}
