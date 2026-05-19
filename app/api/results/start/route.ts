import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { testId, studentName } = await req.json();

    if (!testId || !studentName) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Create a temporary user for this student based on name and a random string to make it unique
    const uniqueEmail = `${studentName.replace(/\s+/g, '').toLowerCase()}_${Date.now()}@student.local`;
    
    const student = await prisma.user.create({
      data: {
        email: uniqueEmail,
        name: studentName,
        role: 'STUDENT',
        classLevel: 'Genel'
      }
    });

    // Create the result record
    const result = await prisma.result.create({
      data: {
        testId,
        studentId: student.id,
        totalScore: 0,
      }
    });

    return NextResponse.json({ success: true, resultId: result.id });
  } catch (error: any) {
    console.error("Result start error:", error);
    return NextResponse.json({ error: "Sınav başlatılamadı" }, { status: 500 });
  }
}
