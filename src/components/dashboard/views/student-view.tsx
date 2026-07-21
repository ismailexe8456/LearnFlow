import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Trophy, Sparkles, Brain, Gamepad2, Star, Flame } from 'lucide-react'

export function StudentDashboard({ profile }: { profile: any }) {
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
          <p className="text-xl font-bold text-slate-600">Ready for another fun adventure today?</p>
          
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full border-2 border-orange-300">
              <Flame className="text-orange-500 w-6 h-6" />
              <span className="font-bold text-orange-700 text-lg">3 Day Streak!</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border-2 border-yellow-400">
              <Star className="text-yellow-500 w-6 h-6" />
              <span className="font-bold text-yellow-700 text-lg">{profile.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Kids Mode Big Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <button className="group relative overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 rounded-[3rem] p-8 text-left transition-transform hover:scale-105 hover:-translate-y-2 border-b-8 border-blue-600 shadow-xl">
            <div className="absolute -right-4 -bottom-4 opacity-50 group-hover:rotate-12 transition-transform duration-500">
              <Gamepad2 className="w-48 h-48 text-white" />
            </div>
            <h3 className="text-3xl font-black text-white relative z-10 mb-2">Play Live Quiz</h3>
            <p className="text-blue-100 font-bold relative z-10 text-lg">Enter a game pin to join the fun!</p>
          </button>
          
          <button className="group relative overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 rounded-[3rem] p-8 text-left transition-transform hover:scale-105 hover:-translate-y-2 border-b-8 border-rose-600 shadow-xl">
            <div className="absolute -right-4 -bottom-4 opacity-50 group-hover:rotate-12 transition-transform duration-500">
              <Brain className="w-48 h-48 text-white" />
            </div>
            <h3 className="text-3xl font-black text-white relative z-10 mb-2">Homework Quests</h3>
            <p className="text-pink-100 font-bold relative z-10 text-lg">Complete assignments to earn stars!</p>
          </button>
        </div>

        {/* Kids Mode Recent Achievements */}
        <div className="bg-white/80 rounded-[3rem] p-8 border-4 border-green-300 shadow-lg">
          <h2 className="text-2xl font-black text-green-600 mb-4 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" /> My Badges
          </h2>
          <div className="flex h-32 items-center justify-center rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300">
            <p className="text-slate-500 font-bold text-lg">You haven't earned any badges yet. Keep playing!</p>
          </div>
        </div>
      </div>
    )
  }

  // NORMAL MODE UI (>=13 years old)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile.full_name}</h2>
          <p className="text-muted-foreground">Here is an overview of your progress and upcoming tasks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Chat Tutor
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            Join Class
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Experience Points (XP)</CardTitle>
            <Star className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.xp}</div>
            <p className="text-xs text-muted-foreground">Level 1 Novice</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Your enrolled courses and recent grades.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <p className="text-sm text-muted-foreground">You are not enrolled in any classes yet.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-md border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Notebook AI
            </CardTitle>
            <CardDescription>Upload a document to generate instant study materials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="py-8">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg">Generate Study Guide</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto">Drop a PDF or PPTX to instantly get flashcards and summaries.</p>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20">
              Upload Document
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
