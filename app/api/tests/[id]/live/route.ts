import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const testId = params.id;

    // Fetch the test details just to know total questions and their original order
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: { orderBy: { id: 'asc' } } }
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
      orderBy: { createdAt: 'asc' }
    });

    const liveData = results.map(r => ({
      resultId: r.id,
      studentName: r.student.name || "İsimsiz",
      score: r.totalScore,
      answersCount: r.details.length,
      totalQuestions: test.questions.length,
      details: r.details
    }));

    // Calculate aggregated question statistics
    const stats = test.questions.map((q, index) => {
      // Find all answer details across all results for this question
      const answersForQ = results.flatMap(r => r.details.filter(d => d.questionId === q.id));
      const totalAnswers = answersForQ.length;
      
      let A = 0, B = 0, C = 0, D = 0, correct = 0;
      
      answersForQ.forEach(ans => {
        if (ans.selectedOption === 'A') A++;
        if (ans.selectedOption === 'B') B++;
        if (ans.selectedOption === 'C') C++;
        if (ans.selectedOption === 'D') D++;
        if (ans.isCorrect) correct++;
      });

      return {
        questionId: q.id,
        questionIndex: index + 1,
        content: q.content,
        totalAnswers,
        correctPct: totalAnswers > 0 ? Math.round((correct / totalAnswers) * 100) : 0,
        optionsPct: {
          A: totalAnswers > 0 ? Math.round((A / totalAnswers) * 100) : 0,
          B: totalAnswers > 0 ? Math.round((B / totalAnswers) * 100) : 0,
          C: totalAnswers > 0 ? Math.round((C / totalAnswers) * 100) : 0,
          D: totalAnswers > 0 ? Math.round((D / totalAnswers) * 100) : 0,
        }
      };
    });

    return NextResponse.json({ success: true, testTitle: test.title, data: liveData, stats });
  } catch (error: any) {
    console.error("Live fetch error:", error);
    return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
  }
}
