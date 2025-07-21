import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { evaluationGridId: string } }) {
  const { evaluationGridId } = params;

  const evaluationGrid = await prisma.evaluationGrid.update({
    where: { id: Number(evaluationGridId) },
    data: { isFinal: true },
  });

  return NextResponse.json(evaluationGrid);
}
