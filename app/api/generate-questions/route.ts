import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { topic, count } = await req.json();
    
    // Check if API key is provided
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Falling back to mock questions.");
      // Fallback mock questions
      const mockQuestions = [
        {
          content: `I _______ to Paris three times in my life. (Topic: ${topic || 'General'})`,
          optionA: "went",
          optionB: "have gone",
          optionC: "have been",
          optionD: "had been",
          correctAnswer: "C",
          grammarFocus: "Present Perfect",
          contextHint: "Experiences in life up to now without a specific time."
        },
        {
          content: "By the time the police arrived, the burglar _______ the house.",
          optionA: "has left",
          optionB: "left",
          optionC: "had left",
          optionD: "was leaving",
          correctAnswer: "C",
          grammarFocus: "Past Perfect",
          contextHint: "An action completed before another action in the past."
        }
      ];
      // Generate dynamically the rest if count > 2 to avoid too much hardcoding if they want 10
      const generatedMocks = [];
      for(let i=0; i<(count || 10); i++) {
         generatedMocks.push(mockQuestions[i % 2]);
      }
      return NextResponse.json({ questions: generatedMocks });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
You are an expert English teacher. 
Generate exactly ${count || 10} multiple-choice English grammar questions for high school students.
The questions MUST focus specifically on this topic/grammar rule: "${topic || 'Present Perfect vs Past Perfect'}".

Return the response ONLY as a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. 
Each object must have exactly these keys:
- "content": The question text with a blank represented by "_______"
- "optionA": First choice
- "optionB": Second choice
- "optionC": Third choice
- "optionD": Fourth choice
- "correctAnswer": The correct option letter ("A", "B", "C", or "D")
- "grammarFocus": A short string describing the grammar rule tested
- "contextHint": A short hint explaining why the answer is correct

Example output:
[
  {
    "content": "I _______ my homework before the teacher arrived.",
    "optionA": "finished",
    "optionB": "have finished",
    "optionC": "had finished",
    "optionD": "was finishing",
    "correctAnswer": "C",
    "grammarFocus": "Past Perfect",
    "contextHint": "An action completed before another past action."
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text || "[]";
    // Clean up potential markdown formatting from the response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const questions = JSON.parse(text);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
