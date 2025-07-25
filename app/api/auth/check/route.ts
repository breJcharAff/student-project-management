import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
            method: "GET",
        })

        const text = await response.text()

        // Return the successful response
        return new NextResponse(text, {
            status: response.status,
            headers: {
                "Content-Type": "text/plain",
            },
        })
    } catch (error) {
        console.error("Backend check proxy error:", error)
        return NextResponse.json({ message: "Could not connect to backend server" }, { status: 500 })
    }
}
