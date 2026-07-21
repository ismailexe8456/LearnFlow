import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages } = await req.json()

    // Fetch the user's profile to inject context (e.g. Kids mode)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, is_kids_mode')
      .eq('id', user.id)
      .single()

    const isKidsMode = profile?.is_kids_mode

    let systemPrompt = `You are a helpful AI Tutor named LearnFlow AI. 
The user talking to you is a ${profile?.role} named ${profile?.full_name}.
Never make up fake information. Use an encouraging, educational tone.`

    if (isKidsMode) {
      systemPrompt += `\nCRITICAL INSTRUCTION: The user is a child (under 13). 
- Use very simple words.
- Be extremely encouraging and use emojis 🌟🎨🚀.
- Keep answers short and fun.
- Explain complex concepts using easy analogies.`
    } else {
      systemPrompt += `\nCRITICAL INSTRUCTION: The user is an older student or teacher. 
- Provide detailed, academically rigorous answers.
- Cite principles and use formatting (bolding, lists) to make study material readable.
- If they ask for a summary, format it beautifully.`
    }

    const result = streamText({
      model: google('gemini-2.5-flash'), // or gemini-2.5-pro for advanced
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('AI Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
