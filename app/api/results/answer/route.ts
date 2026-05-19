import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { resultId, questionId, selectedOption, isCorrect, timeSpentSec } = await req.json();

    if (!resultId || !questionId) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Upsert AnswerDetail just in case they answer the same question multiple times? 
    // Usually they answer once and move on. We'll just create it.
    await prisma.answerDetail.create({
      data: {
        resultId,
        questionId,
        selectedOption,
        isCorrect,
        timeSpentSec: timeSpentSec || 0
      }
    });

    // If correct, update the totalScore by +10
    if (isCorrect) {
      await prisma.result.update({
        where: { id: resultId },
        data: { totalScore: { increment: 10 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Result answer error:", error);
    return NextResponse.json({ error: "Cevap kaydedilemedi" }, { status: 500 });
  }
}
