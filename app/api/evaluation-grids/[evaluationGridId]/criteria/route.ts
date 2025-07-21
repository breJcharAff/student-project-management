import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { evaluationGridId: string } }) {
  const { criteria } = await req.json();
  const { evaluationGridId } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/evaluation-grids/${evaluationGridId}/criteria`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(criteria),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Failed to create criteria" }, { status: response.status });
    }

    const updatedCriteria = await response.json();
    return NextResponse.json(updatedCriteria);
  } catch (error) {
    console.error("Error creating criteria:", error);
    return NextResponse.json({ error: "Failed to create criteria" }, { status: 500 });
  }
}