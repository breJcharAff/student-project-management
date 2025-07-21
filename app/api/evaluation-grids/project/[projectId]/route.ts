import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;

  const evaluationGrids = await prisma.evaluationGrid.findMany({
    where: {
      projectId: Number(projectId),
    },
    include: {
      criteria: true,
      group: true,
      gradedBy: true,
      project: true,
    },
  });

  return NextResponse.json(evaluationGrids);
}