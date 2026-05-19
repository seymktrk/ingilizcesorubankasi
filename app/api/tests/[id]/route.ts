import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const test = await prisma.test.findUnique({
      where: { id: params.id },
      include: { questions: true }
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
