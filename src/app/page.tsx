import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { Users, Presentation, BookOpen, Sparkles } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  // Real live database queries - 0 when empty
  const [
    { count: userCount },
    { count: classCount },
    { count: quizCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-purple-500/30">
      <header className="px-6 h-16 flex items-center border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            L
          </div>
          LearnFlow
        </div>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4 mr-2 text-purple-500 animate-pulse" />
            AI-Powered Ecosystem for Teachers & Students
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            The ultimate platform for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              modern education.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Kahoot-style live quizzes, NotebookLM document notes, Google Classroom-style management, and flashcards built directly into one real-time platform.
          </p>

          {/* Real Live Database Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4 pb-2">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{userCount ?? 0}</div>
              <div className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5" /> Total Users
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{classCount ?? 0}</div>
              <div className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Active Classes
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
              <div className="text-3xl font-black text-pink-600 dark:text-pink-400">{quizCount ?? 0}</div>
              <div className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-center gap-1">
                <Presentation className="w-3.5 h-3.5" /> Quizzes Created
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-purple-500/20 rounded-full transition-all hover:scale-105">
                Start Learning for Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
