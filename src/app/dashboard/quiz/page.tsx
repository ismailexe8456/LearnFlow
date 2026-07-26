import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Presentation, Plus, Play, KeyRound, Sparkles, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

async function startLiveSession(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const quizId = formData.get('quizId') as string

  // Generate 6 digit game PIN
  const gamePin = Math.floor(100000 + Math.random() * 900000).toString()

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      quiz_id: quizId,
      code: gamePin,
      status: 'waiting',
      current_question_index: 0,
    })
    .select()
    .single()

  if (error || !session) {
    redirect(`/dashboard/quiz?error=${encodeURIComponent(error?.message || 'Failed to start live session')}`)
  }

  redirect(`/play/${gamePin}?host=true`)
}

export default async function QuizPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Presentation className="w-8 h-8 text-indigo-500" />
            Kahoot-Style Quiz Builder
          </h1>
          <p className="text-muted-foreground">Create multiple-choice quizzes manually or with AI, then host live PIN games.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/quiz/join">
            <Button variant="outline">
              <KeyRound className="w-4 h-4 mr-2" /> Join Live Game
            </Button>
          </Link>
          <Link href="/dashboard/quiz/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Create New Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          My Quizzes ({quizzes?.length || 0})
        </h2>

        {(!quizzes || quizzes.length === 0) ? (
          <Card className="p-12 text-center bg-white/50 dark:bg-black/40">
            <Presentation className="w-12 h-12 text-indigo-500 mx-auto opacity-50 mb-3" />
            <p className="text-muted-foreground mb-4">You haven't created any quizzes yet.</p>
            <Link href="/dashboard/quiz/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Sparkles className="w-4 h-4 mr-2" /> Create Quiz with AI
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-slate-200 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description || "No description."}</CardDescription>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    <HelpCircle className="w-3.5 h-3.5" /> {quiz.quiz_questions?.length || 0} Questions
                  </span>
                </CardHeader>
                <CardContent className="flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-muted-foreground font-mono">Code: {quiz.code}</span>
                  <form action={startLiveSession}>
                    <input type="hidden" name="quizId" value={quiz.id} />
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                      <Play className="w-4 h-4 mr-1" /> Host Live Game
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
