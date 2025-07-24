import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        // Get the group ID from the query parameters
        const url = new URL(request.url)
        const groupId = url.searchParams.get("groupId")

        if (!groupId) {
            return NextResponse.json({ error: "Group ID is required" }, { status: 400 })
        }

        console.log("Upload request for group:", groupId)

        // Get the authorization header from the request
        const authHeader = request.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Authorization required" }, { status: 401 })
        }

        // Get the form data from the request
        const formData = await request.formData()

        // Log the form data for debugging
        console.log("Form data received:")
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
            } else {
                console.log(`${key}: ${value}`)
            }
        }

        // Make the request to the backend API
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/deliverables/${groupId}/`
        console.log("Making request to:", backendUrl)

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Authorization: authHeader,
            },
            body: formData,
        })

        console.log("Backend response status:", response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Backend error response:", errorText)
            return NextResponse.json(
                { error: `Upload failed: ${response.status} - ${errorText}` },
                { status: response.status },
            )
        }

        const data = await response.json()
        console.log("Upload successful:", data)

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}` },
            { status: 500 },
        )
    }
}
