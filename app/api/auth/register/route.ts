import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get("authorization")

    const response = await fetch("https://pa-backend-ar8v.onrender.com/auth/register", {
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

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Registration proxy error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
