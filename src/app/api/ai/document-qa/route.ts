import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, documentId } = await req.json()

    // Fetch document content
    const { data: doc } = await supabase
      .from('documents')
      .select('title, content')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const systemPrompt = `You are NotebookLM AI, an expert study assistant.
You are strictly answering questions based on the following document context:

--- DOCUMENT TITLE: ${doc.title} ---
${doc.content}
--- END DOCUMENT CONTEXT ---

CRITICAL INSTRUCTIONS:
- Answer accurately based ONLY on the provided document text.
- If the question cannot be answered from the document, politely state that it's not mentioned in the provided text.
- Provide structured bullet points, key takeaways, or clear explanations.`

    const result = await streamText({
      model: google('gemini-2.5-flash') as any,
      system: systemPrompt,
      messages,
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error('Document QA Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
