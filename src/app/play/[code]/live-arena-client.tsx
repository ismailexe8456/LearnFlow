'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Play, Trophy, CheckCircle2, XCircle, Timer, Award } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function LiveQuizArena({
  session,
  quiz,
  questions,
  isHost,
  playerNickname,
}: {
  session: any
  quiz: any
  questions: any[]
  isHost: boolean
  playerNickname: string
}) {
  const supabase = createClient()
  const [currentIdx, setCurrentIdx] = useState(session.current_question_index || 0)
  const [status, setStatus] = useState(session.status || 'waiting')
  const [participants, setParticipants] = useState<any[]>([])
  
  // Player state
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)

  const currentQ = questions[currentIdx]

  useEffect(() => {
    // Subscribe to Supabase Realtime for game session updates
    const channel = supabase.channel(`game_session_${session.id}`)

    channel
      .on('broadcast', { event: 'game_state' }, (payload) => {
        if (payload.payload.status) setStatus(payload.payload.status)
        if (payload.payload.currentIdx !== undefined) {
          setCurrentIdx(payload.payload.currentIdx)
          setSelectedOption(null)
          setAnswered(false)
        }
      })
      .on('broadcast', { event: 'player_joined' }, (payload) => {
        setParticipants((prev) => [...prev, payload.payload])
      })
      .on('broadcast', { event: 'score_update' }, (payload) => {
        setParticipants((prev) =>
          prev.map((p) => (p.nickname === payload.payload.nickname ? { ...p, score: payload.payload.score } : p))
        )
      })
      .subscribe()

    // Announce player joining if not host
    if (!isHost) {
      channel.send({
        type: 'broadcast',
        event: 'player_joined',
        payload: { nickname: playerNickname, score: 0 },
      })
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id])

  const broadcastState = async (newStatus: string, newIdx: number) => {
    setStatus(newStatus)
    setCurrentIdx(newIdx)
    const channel = supabase.channel(`game_session_${session.id}`)
    await channel.send({
      type: 'broadcast',
      event: 'game_state',
      payload: { status: newStatus, currentIdx: newIdx },
    })
  }

  const handleSelectOption = async (optionIdx: number) => {
    if (answered || !currentQ) return
    setSelectedOption(optionIdx)
    setAnswered(true)

    const isCorrect = optionIdx === currentQ.correct_option_index
    const points = isCorrect ? 1000 : 0
    const newScore = score + points
    setScore(newScore)

    // Broadcast score
    const channel = supabase.channel(`game_session_${session.id}`)
    await channel.send({
      type: 'broadcast',
      event: 'score_update',
      payload: { nickname: playerNickname, score: newScore },
    })
  }

  // Color mapping for Kahoot-style buttons
  const colors = [
    'bg-red-500 hover:bg-red-600 text-white',
    'bg-blue-500 hover:bg-blue-600 text-white',
    'bg-yellow-500 hover:bg-yellow-600 text-white',
    'bg-green-500 hover:bg-green-600 text-white',
  ]

  // HOST VIEW
  if (isHost) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col justify-between">
        {/* Top Host Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-slate-400">Host Control Screen</p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 px-4 py-2 rounded-xl text-indigo-400 font-mono font-bold text-xl">
            GAME PIN: {session.code}
          </div>
        </div>

        {/* Game Stage */}
        {status === 'waiting' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 my-8">
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-extrabold">Waiting for players to join...</h2>
            <p className="text-slate-400 text-lg">Tell players to go to <code className="text-indigo-400 font-mono font-bold">/dashboard/quiz/join</code> and enter PIN <code className="text-white font-mono font-bold">{session.code}</code></p>
            
            <div className="flex flex-wrap gap-3 max-w-2xl justify-center pt-4">
              {participants.map((p, i) => (
                <span key={i} className="bg-slate-800 px-4 py-2 rounded-full font-bold text-sm text-indigo-300 border border-slate-700">
                  🎮 {p.nickname}
                </span>
              ))}
            </div>

            <Button
              onClick={() => broadcastState('active', 0)}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl px-12 py-6 rounded-full font-bold shadow-xl"
            >
              <Play className="w-6 h-6 mr-2 fill-current" /> Start Game
            </Button>
          </div>
        )}

        {status === 'active' && currentQ && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 my-8 max-w-4xl mx-auto w-full">
            <div className="w-full text-center space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {currentQ.question}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {currentQ.options?.map((opt: string, i: number) => (
                <div key={i} className={`p-6 rounded-2xl font-bold text-xl ${colors[i % 4]} flex items-center gap-3 shadow-lg`}>
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              {currentIdx < questions.length - 1 ? (
                <Button
                  onClick={() => broadcastState('active', currentIdx + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-bold"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={() => broadcastState('finished', currentIdx)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg font-bold"
                >
                  Finish Game Podiums
                </Button>
              )}
            </div>
          </div>
        )}

        {status === 'finished' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 my-8">
            <Trophy className="w-24 h-24 text-yellow-400 animate-bounce" />
            <h2 className="text-4xl font-black text-white">Quiz Completed!</h2>
            <p className="text-slate-400 text-lg">Great job hosting!</p>
          </div>
        )}
      </div>
    )
  }

  // PLAYER VIEW
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col justify-between max-w-2xl mx-auto">
      {/* Player Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="font-bold text-lg">{playerNickname}</h2>
          <p className="text-xs text-slate-400">PIN: {session.code}</p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full text-yellow-400 font-bold text-sm">
          <Award className="w-4 h-4 text-yellow-500" /> {score} Points
        </div>
      </div>

      {status === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-12">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center animate-spin">
            <Timer className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold">You're in!</h3>
          <p className="text-slate-400">See your nickname on the screen? Waiting for host to start...</p>
        </div>
      )}

      {status === 'active' && currentQ && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-8 w-full">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Question {currentIdx + 1}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold">{currentQ.question}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {currentQ.options?.map((opt: string, i: number) => (
              <Button
                key={i}
                disabled={answered}
                onClick={() => handleSelectOption(i)}
                className={`h-20 text-lg font-bold rounded-2xl ${colors[i % 4]} ${selectedOption === i ? 'ring-4 ring-white' : ''}`}
              >
                {opt}
              </Button>
            ))}
          </div>

          {answered && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center w-full">
              <p className="font-semibold text-sm">Answer Submitted!</p>
              <p className="text-xs text-slate-400 mt-1">Waiting for host to reveal next question...</p>
            </div>
          )}
        </div>
      )}

      {status === 'finished' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-12">
          <Trophy className="w-20 h-20 text-yellow-400" />
          <h3 className="text-3xl font-bold">Final Score: {score}</h3>
          <p className="text-slate-400">Thanks for playing!</p>
        </div>
      )}
    </div>
  )
}
