import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const testId = params.id;

    // Fetch the test details just to know total questions
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: { select: { id: true } } }
    });

    if (!test) {
      return NextResponse.json({ error: "Test bulunamadı" }, { status: 404 });
    }

    // Fetch all results for this test, including student info and their answers
    const results = await prisma.result.findMany({
      where: { testId },
      include: {
        student: { select: { name: true } },
        details: { select: { questionId: true, isCorrect: true, selectedOption: true } }
      },
      orderBy: { createdAt: 'asc' } // Joined first
    });

    const liveData = results.map(r => ({
      resultId: r.id,
      studentName: r.student.name || "İsimsiz",
      score: r.totalScore,
      answersCount: r.details.length,
      totalQuestions: test.questions.length,
      details: r.details
    }));

    return NextResponse.json({ success: true, testTitle: test.title, data: liveData });
  } catch (error: any) {
    console.error("Live fetch error:", error);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
