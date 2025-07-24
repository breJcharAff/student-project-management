import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        console.log("Forwarding login request to backend:", { email: body.email })

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        console.log("Backend response status:", response.status, response.statusText)

        const contentType = response.headers.get("content-type")

        let data
        if (contentType && contentType.includes("application/json")) {
            data = await response.json()
        } else {
            const text = await response.text()
            console.log("Backend returned non-JSON response:", text.substring(0, 200) + "...")

            return NextResponse.json(
                {
                    message: response.ok
                        ? "Unexpected response format from server"
                        : `Server error: ${response.status} ${response.statusText}`,
                },
                { status: response.ok ? 500 : response.status },
            )
        }

        if (!response.ok) {
            console.log("Backend returned error:", data)
            return NextResponse.json({ message: data.message || "Authentication failed" }, { status: response.status })
        }

        console.log("Login successful:", data)
        return NextResponse.json(data)
    } catch (error) {
        console.error("Login proxy error:", error)
        return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
    }
}
