import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, numQuestions } = await req.json()

    const prompt = `Generate a quiz on the topic "${topic}" with ${numQuestions || 5} multiple choice questions.
Return ONLY valid JSON in the following exact format without any markdown formatting or code blocks:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option_index": 0,
    "time_limit_secs": 30
  }
]`

    const { text } = await generateText({
      model: google('gemini-2.5-flash') as any,
      prompt,
    })

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const questions = JSON.parse(cleanText)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Generate Quiz Error:', error)
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
