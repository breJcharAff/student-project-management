import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        console.log("Forwarding login request to backend:", { email: body.email })

        // Forward the request to the actual backend - using /auth/login instead of /login
        const response = await fetch("https://pa-backend-ar8v.onrender.com/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        console.log("Backend response status:", response.status, response.statusText)

        // Check the content type to determine how to parse the response
        const contentType = response.headers.get("content-type")

        let data
        if (contentType && contentType.includes("application/json")) {
            data = await response.json()
        } else {
            // If it's not JSON, get the text (likely HTML error page)
            const text = await response.text()
            console.log("Backend returned non-JSON response:", text.substring(0, 200) + "...")

            // Return a structured error response
            return NextResponse.json(
                {
                    message: response.ok
                        ? "Unexpected response format from server"
                        : `Server error: ${response.status} ${response.statusText}`,
                },
                { status: response.ok ? 500 : response.status },
            )
        }

        // If the response is not ok, return the error
        if (!response.ok) {
            console.log("Backend returned error:", data)
            return NextResponse.json({ message: data.message || "Authentication failed" }, { status: response.status })
        }

        console.log("Login successful:", data)
        // Return the successful response with token and user data
        return NextResponse.json(data)
    } catch (error) {
        console.error("Login proxy error:", error)
        return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
    }
}
