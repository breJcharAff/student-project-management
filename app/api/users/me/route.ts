import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken: any;
    try {
      // For simplicity, we are just decoding here. In a real app, you'd verify the token.
      decodedToken = jwt.decode(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    const userId = decodedToken.id;
    console.log("Fetching user data for userId:", userId);
    console.log("Authorization header sent to backend:", `Bearer ${token}`);

    // Fetch user data from the backend
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}