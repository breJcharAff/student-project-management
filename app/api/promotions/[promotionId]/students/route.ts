import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: { promotionId: string } }) {
  try {
    const { promotionId } = params
    const body = await req.json()
    const authHeader = req.headers.get("authorization")

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promotions/${promotionId}/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Add students to promotion proxy error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
