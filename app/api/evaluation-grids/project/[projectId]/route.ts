import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/evaluation-grids/project/${projectId}`);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || "Failed to fetch evaluation grids" }, { status: response.status });
    }

    const evaluationGrids = await response.json();
    return NextResponse.json(evaluationGrids);
  } catch (error) {
    console.error("Error fetching evaluation grids:", error);
    return NextResponse.json({ error: "Failed to fetch evaluation grids" }, { status: 500 });
  }
}