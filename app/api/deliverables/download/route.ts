import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Get the deliverable ID from query params
        const url = new URL(request.url)
        const deliverableId = url.searchParams.get("deliverableId")

        if (!deliverableId) {
            return NextResponse.json({ error: "Deliverable ID is required" }, { status: 400 })
        }

        // Get the authorization header from the request
        const authHeader = request.headers.get("authorization")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deliverables/${deliverableId}/download`, {
            method: "GET",
            headers: {
                ...(authHeader && { Authorization: authHeader }),
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: `Download failed: ${response.status}` }, { status: response.status })
        }

        // Get the file as a blob
        const blob = await response.blob()

        // Get filename from Content-Disposition header if available
        const contentDisposition = response.headers.get("content-disposition")
        let filename = "deliverable.zip"
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/)
            if (filenameMatch) {
                filename = filenameMatch[1]
            }
        }

        // Return the file with appropriate headers
        return new NextResponse(blob, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("Download error:", error)
        return NextResponse.json({ error: "Download failed" }, { status: 500 })
    }
}
