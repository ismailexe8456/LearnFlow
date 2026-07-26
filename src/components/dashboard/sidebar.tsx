import Link from 'next/link'
import { BookOpen, GraduationCap, LayoutDashboard, Settings, Layers, FileText, ShieldCheck } from 'lucide-react'

export function Sidebar({ role, isKidsMode }: { role: string, isKidsMode: boolean }) {
  const teacherLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', href: '/dashboard/classes', icon: BookOpen },
    { name: 'NotebookLM Notes', href: '/dashboard/notes', icon: FileText },
    { name: 'Quiz Builder', href: '/dashboard/quiz', icon: GraduationCap },
    { name: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
  ]

  const studentLinks = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Classes', href: '/dashboard/classes', icon: BookOpen },
    { name: 'NotebookLM Notes', href: '/dashboard/notes', icon: FileText },
    { name: 'Live Quizzes', href: '/dashboard/quiz/join', icon: GraduationCap },
    { name: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
  ]

  const links = role === 'teacher' ? teacherLinks : studentLinks

  return (
    <div className={`w-64 h-full border-r bg-white/50 dark:bg-black/40 backdrop-blur-md hidden md:flex flex-col ${isKidsMode ? 'rounded-r-3xl border-4 border-purple-300' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight border-b border-slate-200 dark:border-slate-800">
        <div className={`w-8 h-8 mr-2 flex items-center justify-center text-white font-bold ${isKidsMode ? 'bg-yellow-400 rounded-full' : 'bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg'}`}>
          L
        </div>
        LearnFlow
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isKidsMode ? 'hover:bg-purple-100 hover:scale-105 font-bold text-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium'}`}
          >
            <link.icon className={isKidsMode ? "w-6 h-6 text-purple-500" : "w-4 h-4 text-slate-500"} />
            {link.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <Link
          href="/holyairballbonga"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isKidsMode ? 'hover:bg-purple-100 font-bold text-lg text-red-500' : 'hover:bg-red-500/10 text-red-500 dark:text-red-400 text-sm font-medium'}`}
        >
          <ShieldCheck className={isKidsMode ? "w-6 h-6 text-red-500" : "w-4 h-4 text-red-500"} />
          Admin Panel
        </Link>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isKidsMode ? 'hover:bg-purple-100 hover:scale-105 font-bold text-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium'}`}
        >
          <Settings className={isKidsMode ? "w-6 h-6 text-purple-500" : "w-4 h-4 text-slate-500"} />
          Settings
        </Link>
      </div>
    </div>
  )
}
