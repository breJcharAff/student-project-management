import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { evaluationGridId: string } }) {
  const { evaluationGridId } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/evaluation-grids/finalize/${evaluationGridId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Failed to finalize evaluation grid" }, { status: response.status });
    }

    const evaluationGrid = await response.json();
    return NextResponse.json(evaluationGrid);
  } catch (error) {
    console.error("Error finalizing evaluation grid:", error);
    return NextResponse.json({ error: "Failed to finalize evaluation grid" }, { status: 500 });
  }
}
