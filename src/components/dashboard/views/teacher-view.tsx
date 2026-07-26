import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, BookOpen, Presentation, ShieldCheck, Sparkles, FileText } from 'lucide-react'
import Link from 'next/link'

export function TeacherDashboard({ profile, stats }: { profile: any; stats: { classCount: number; quizCount: number } }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome, {profile.full_name}</h2>
            {profile.is_admin && (
              <Link href="/holyairballbonga" className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 text-xs px-2.5 py-1 rounded-full font-bold border border-red-500/30 hover:bg-red-500/20 transition-all">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
              </Link>
            )}
          </div>
          <p className="text-muted-foreground">Manage your classrooms, assignments, and AI quizzes.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/classes">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Class
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.classCount}</div>
            <p className="text-xs text-muted-foreground">Live database count</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Quizzes Created</CardTitle>
            <Presentation className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.quizCount}</div>
            <p className="text-xs text-muted-foreground">Live database count</p>
          </CardContent>
        </Card>
        <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Teacher XP</CardTitle>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{profile.xp}</div>
            <p className="text-xs text-muted-foreground">Platform level</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle>My Classrooms</CardTitle>
            <CardDescription>Manage classes and student rosters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <BookOpen className="w-10 h-10 text-indigo-500 opacity-60" />
              <p className="text-sm text-muted-foreground">
                {stats.classCount > 0 
                  ? `You have ${stats.classCount} active class(es). Click below to view roster and join codes.`
                  : "No active classes created yet."}
              </p>
              <Link href="/dashboard/classes">
                <Button variant="outline" size="sm">Manage Classes</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Tools for your classroom.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/quiz/new" className="block w-full">
              <Button variant="outline" className="w-full justify-start h-14 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
                <Presentation className="mr-3 h-5 w-5 text-indigo-500" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Create Kahoot-Style Quiz</div>
                  <div className="text-xs text-muted-foreground">Manual or AI question generator</div>
                </div>
              </Button>
            </Link>

            <Link href="/dashboard/notes" className="block w-full">
              <Button variant="outline" className="w-full justify-start h-14 border-purple-200 dark:border-purple-900 hover:bg-purple-50 dark:hover:bg-purple-950/50">
                <FileText className="mr-3 h-5 w-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-sm">NotebookLM AI Notes</div>
                  <div className="text-xs text-muted-foreground">Upload documents & ask questions</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/dashboard/classes" className="block w-full">
              <Button variant="outline" className="w-full justify-start h-14 border-pink-200 dark:border-pink-900 hover:bg-pink-50 dark:hover:bg-pink-950/50">
                <BookOpen className="mr-3 h-5 w-5 text-pink-500" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Create New Class</div>
                  <div className="text-xs text-muted-foreground">Generate 6-digit student join code</div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
