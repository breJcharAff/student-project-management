import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { deliverableId: string } }) {
    try {
        const { deliverableId } = params
        const authHeader = request.headers.get("authorization")

        const response = await fetch(`https://pa-backend-ar8v.onrender.com/deliverables/${deliverableId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { message: errorData.message || "Failed to delete deliverable" },
                { status: response.status },
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete deliverable proxy error:", error)
        return NextResponse.json({ message: "An error occurred while deleting the deliverable" }, { status: 500 })
    }
}
