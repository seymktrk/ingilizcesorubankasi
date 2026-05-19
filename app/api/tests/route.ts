import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, targetClass, timeLimitSec, teacherId, questions } = data;

    // We assume teacherId is provided from client session, for demo we mock it if empty
    // To ensure the teacher exists, let's upsert a demo teacher
    const teacher = await prisma.user.upsert({
      where: { email: 'demo_teacher@example.com' },
      update: {},
      create: {
        email: 'demo_teacher@example.com',
        name: 'Demo Teacher',
        role: 'TEACHER',
      }
    });

    const test = await prisma.test.create({
      data: {
        title: title || "Yeni Test",
        targetClass: targetClass || "10",
        timeLimitSec: timeLimitSec || 60,
        teacherId: teacher.id,
        questions: {
          create: questions.map((q: any) => ({
            content: q.content,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            grammarFocus: q.grammarFocus,
            contextHint: q.contextHint
          }))
        }
      }
    });

    return NextResponse.json({ success: true, test });
  } catch (error: any) {
    console.error("Test save error:", error);
    return NextResponse.json({ error: "Sınav kaydedilemedi: " + error.message }, { status: 500 });
  }
}
