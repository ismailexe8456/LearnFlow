import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LiveQuizArena } from './live-arena-client'

export default async function LivePlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ nickname?: string; host?: string }>
}) {
  const { code } = await params
  const { nickname, host } = await searchParams
  const isHost = host === 'true'

  const supabase = await createClient()

  // Fetch session by code
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*, quizzes(*, quiz_questions(*))')
    .eq('code', code)
    .single()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-500">Game PIN Not Found</h1>
          <p className="text-slate-400">PIN <code className="font-mono text-white">{code}</code> is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <LiveQuizArena 
      session={session}
      quiz={session.quizzes}
      questions={session.quizzes?.quiz_questions || []}
      isHost={isHost}
      playerNickname={nickname || 'Player'}
    />
  )
}
