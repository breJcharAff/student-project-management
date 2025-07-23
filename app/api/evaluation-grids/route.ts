import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Authorization required" }, { status: 401 })
        }

        const body = await request.json()

        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/evaluation-grids`

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorText = await response.text()
            return NextResponse.json(
                { error: `Backend request failed: ${response.status} - ${errorText}` },
                { status: response.status },
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error("Proxy error:", error)
        return NextResponse.json(
            { error: `Proxy failed: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 },
        )
    }
}