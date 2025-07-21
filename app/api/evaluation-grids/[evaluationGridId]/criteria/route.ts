import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { evaluationGridId: string } }) {
  const { criteria } = await req.json();
  const { evaluationGridId } = params;

  const updatedCriteria = await prisma.criteria.createMany({
    data: criteria.map((c: any) => ({
      ...c,
      evaluationGridId: Number(evaluationGridId),
    })),
  });

  return NextResponse.json(updatedCriteria);
}