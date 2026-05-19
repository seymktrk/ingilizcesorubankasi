import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { testId, totalScore, details } = data;
    // details is an array: { questionId, selectedOption, isCorrect, timeSpentSec }

    const student = await prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        email: 'student@example.com',
        name: 'Demo Student',
        role: 'STUDENT',
        classLevel: "10"
      }
    });

    if (testId) {
      const result = await prisma.result.create({
        data: {
          testId,
          studentId: student.id,
          totalScore: totalScore || 0,
          details: {
            create: details.map((d: any) => ({
              questionId: d.questionId,
              selectedOption: d.selectedOption,
              isCorrect: d.isCorrect,
              timeSpentSec: d.timeSpentSec || 0
            }))
          }
        }
      });
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ success: true, message: "Mock saved" });
  } catch (error: any) {
    console.error("Result save error:", error);
    return NextResponse.json({ error: "Sonuç kaydedilemedi" }, { status: 500 });
  }
}
