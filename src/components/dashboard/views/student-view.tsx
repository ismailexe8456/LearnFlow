import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Trophy, Sparkles, Brain, Gamepad2, Star, ShieldCheck, Layers, FileText } from 'lucide-react'
import { AIChat } from '../ai-chat'
import Link from 'next/link'

export function StudentDashboard({ profile, stats }: { profile: any; stats: { enrolledCount: number; deckCount: number } }) {
  const isKidsMode = profile.is_kids_mode;

  if (isKidsMode) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Kids Mode Header */}
        <div className="flex flex-col items-center text-center space-y-4 bg-white/80 p-8 rounded-[3rem] shadow-xl border-4 border-yellow-300">
          <div className="flex items-center gap-4">
            <span className="text-6xl">👋</span>
            <h1 className="text-4xl md:text-5xl font-black text-purple-600 drop-shadow-sm">
              Hi, {profile.full_name.split(' ')[0]}!
            </h1>
          </div>
          <p className="text-xl font-bold text-slate-600">Ready for another fun learning adventure today?</p>
          
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border-2 border-yellow-400">
              <Star className="text-yellow-500 w-6 h-6" />
              <span className="font-bold text-yellow-700 text-lg">{profile.xp} XP</span>
            </div>
            {profile.is_admin && (
              <Link href="/holyairballbonga" className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full border-2 border-red-400 text-red-700 font-bold">
                <ShieldCheck className="w-5 h-5 text-red-500" /> Admin
              </Link>
            )}
          </div>
        </div>

        {/* Kids Mode Big Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/quiz/join" className="block">
            <button className="w-full group relative overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 rounded-[3rem] p-8 text-left transition-transform hover:scale-105 hover:-translate-y-2 border-b-8 border-blue-600 shadow-xl">
              <div className="absolute -right-4 -bottom-4 opacity-50 group-hover:rotate-12 transition-transform duration-500">
                <Gamepad2 className="w-48 h-48 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white relative z-10 mb-2">Play Live Quiz</h3>
              <p className="text-blue-100 font-bold relative z-10 text-lg">Enter a game PIN to join live!</p>
            </button>
          </Link>
          
          <Link href="/dashboard/flashcards" className="block">
            <button className="w-full group relative overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 rounded-[3rem] p-8 text-left transition-transform hover:scale-105 hover:-translate-y-2 border-b-8 border-rose-600 shadow-xl">
              <div className="absolute -right-4 -bottom-4 opacity-50 group-hover:rotate-12 transition-transform duration-500">
                <Brain className="w-48 h-48 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white relative z-10 mb-2">Flashcard Decks</h3>
              <p className="text-pink-100 font-bold relative z-10 text-lg">Study decks ({stats.deckCount} active)</p>
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // STANDARD MODE (>=13 years old)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile.full_name}</h2>
            {profile.is_admin && (
              <Link href="/holyairballbonga" className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 text-xs px-2.5 py-1 rounded-full font-bold border border-red-500/30 hover:bg-red-500/20 transition-all">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}
          </div>
          <p className="text-muted-foreground">Here is your learning overview.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/classes">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              Join Class
            </Button>
          </Link>
          <Link href="/dashboard/quiz/join">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
              <Gamepad2 className="w-4 h-4 mr-2" /> Live Quiz
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Experience Points (XP)</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{profile.xp}</div>
            <p className="text-xs text-muted-foreground">Live XP total</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.enrolledCount}</div>
            <p className="text-xs text-muted-foreground">Live database count</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Flashcard Decks</CardTitle>
            <Layers className="w-4 h-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.deckCount}</div>
            <p className="text-xs text-muted-foreground">My created decks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Quick Study Tools</CardTitle>
              <CardDescription>Access classes, flashcards, and NotebookLM AI notes.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/flashcards">
                <Button variant="outline" className="w-full h-20 flex-col gap-1 border-pink-500/20 hover:bg-pink-500/10">
                  <Layers className="w-6 h-6 text-pink-500" />
                  <span className="font-semibold text-sm">Study Flashcards</span>
                </Button>
              </Link>
              <Link href="/dashboard/notes">
                <Button variant="outline" className="w-full h-20 flex-col gap-1 border-purple-500/20 hover:bg-purple-500/10">
                  <FileText className="w-6 h-6 text-purple-500" />
                  <span className="font-semibold text-sm">NotebookLM Notes</span>
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-sm mb-1">Join a Classroom</h4>
              <p className="text-xs text-muted-foreground mb-3">Ask your teacher for their 6-character class code.</p>
              <Link href="/dashboard/classes">
                <Button size="sm" variant="default">Go to Classes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3">
          <AIChat />
        </div>
      </div>
    </div>
  )
}
