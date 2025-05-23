import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Forward the request to the actual backend
        const response = await fetch("https://pa-backend-ar8v.onrender.com/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        // Get the response data
        const data = await response.json()

        // If the response is not ok, return the error
        if (!response.ok) {
            return NextResponse.json({ message: data.message || "Authentication failed" }, { status: response.status })
        }

        // Return the successful response
        return NextResponse.json(data)
    } catch (error) {
        console.error("Login proxy error:", error)
        return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
    }
}
