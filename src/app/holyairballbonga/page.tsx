import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Users, BookOpen, Presentation, Database, FileText, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

async function toggleAdminStatus(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const targetUserId = formData.get('targetUserId') as string
  const currentStatus = formData.get('currentStatus') === 'true'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Verify requester is admin
  const { data: requesterProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!requesterProfile?.is_admin) return

  await supabase
    .from('profiles')
    .update({ is_admin: !currentStatus })
    .eq('id', targetUserId)

  revalidatePath('/holyairballbonga')
}

export default async function AdminPanelPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Strict RLS / Profile Admin check
  if (!profile || !profile.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <Card className="max-w-md w-full bg-slate-900 border-red-500/30 text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-slate-400 text-sm">
            Route <code className="text-red-400 font-mono">/holyairballbonga</code> is restricted to accounts with the <code className="text-red-400 font-mono">is_admin</code> flag enabled on their profile.
          </p>
          <Link href="/dashboard" className="block pt-2">
            <Button variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Fetch real database counts
  const [
    { count: totalTeachers },
    { count: totalStudents },
    { count: totalAdmins },
    { count: totalClasses },
    { count: totalQuizzes },
    { count: totalDecks },
    { count: totalDocuments },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_admin', true),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('flashcard_decks').select('*', { count: 'exact', head: true }),
    supabase.from('documents').select('*', { count: 'exact', head: true }),
  ])

  // Fetch all user profiles for admin table
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const stats = [
    { name: 'Total Teachers', value: totalTeachers ?? 0, icon: Users, color: 'text-blue-500' },
    { name: 'Total Students', value: totalStudents ?? 0, icon: Users, color: 'text-purple-500' },
    { name: 'Total Admins', value: totalAdmins ?? 0, icon: ShieldCheck, color: 'text-emerald-500' },
    { name: 'Total Classes', value: totalClasses ?? 0, icon: BookOpen, color: 'text-amber-500' },
    { name: 'Total Quizzes', value: totalQuizzes ?? 0, icon: Presentation, color: 'text-pink-500' },
    { name: 'Flashcard Decks', value: totalDecks ?? 0, icon: Database, color: 'text-cyan-500' },
    { name: 'AI Documents', value: totalDocuments ?? 0, icon: FileText, color: 'text-indigo-500' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Protected Admin Zone
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">/holyairballbonga Master Panel</h1>
          <p className="text-slate-400 text-sm">Authenticated as Admin: <span className="text-white font-medium">{profile.full_name}</span></p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline" className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-white">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Database Stats Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Live Platform Database Metrics
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">{stat.name}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">Live query count</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Profiles Management Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">User Accounts & Role Control</CardTitle>
          <CardDescription className="text-slate-400">
            Real users registered in Supabase auth database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Admin Status</th>
                  <th className="py-3 px-4">XP</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {allProfiles?.map((userProf) => (
                  <tr key={userProf.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium">{userProf.full_name}</td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${userProf.role === 'teacher' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                        {userProf.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {userProf.is_admin ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{userProf.xp} XP</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(userProf.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <form action={toggleAdminStatus}>
                        <input type="hidden" name="targetUserId" value={userProf.id} />
                        <input type="hidden" name="currentStatus" value={String(userProf.is_admin)} />
                        <Button 
                          type="submit" 
                          size="sm" 
                          variant={userProf.is_admin ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {userProf.is_admin ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
