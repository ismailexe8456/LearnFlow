import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Users, Plus, KeyRound, CheckCircle2, UserCheck } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function createClassAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Generate 6-char unique code e.g. "K7M9P2"
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { error } = await supabase.from('classes').insert({
    teacher_id: user.id,
    name,
    description,
    join_code: joinCode,
  })

  if (error) {
    redirect(`/dashboard/classes?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/classes')
  redirect('/dashboard/classes')
}

async function joinClassAction(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const joinCode = (formData.get('joinCode') as string)?.trim()?.toUpperCase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Find class by code
  const { data: targetClass, error: findError } = await supabase
    .from('classes')
    .select('id')
    .eq('join_code', joinCode)
    .single()

  if (findError || !targetClass) {
    redirect(`/dashboard/classes?error=${encodeURIComponent('Invalid class join code.')}`)
  }

  // Insert into class_members
  const { error: joinError } = await supabase.from('class_members').insert({
    class_id: targetClass.id,
    student_id: user.id,
  })

  if (joinError) {
    if (joinError.code === '23505') {
      redirect(`/dashboard/classes?error=${encodeURIComponent('You are already enrolled in this class.')}`)
    }
    redirect(`/dashboard/classes?error=${encodeURIComponent(joinError.message)}`)
  }

  revalidatePath('/dashboard/classes')
  redirect('/dashboard/classes')
}

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const isTeacher = profile.role === 'teacher'

  let teacherClasses: any[] = []
  let studentEnrollments: any[] = []

  if (isTeacher) {
    const { data } = await supabase
      .from('classes')
      .select('*, class_members(student_id, profiles(full_name, created_at))')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    teacherClasses = data || []
  } else {
    const { data } = await supabase
      .from('class_members')
      .select('joined_at, classes(*, profiles:teacher_id(full_name))')
      .eq('student_id', user.id)
      .order('joined_at', { ascending: false })
    studentEnrollments = data || []
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Classroom Hub</h1>
          <p className="text-muted-foreground">
            {isTeacher ? "Create classrooms and manage student join codes." : "Join your teachers' classrooms and view enrolled courses."}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isTeacher ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Create Class Form */}
          <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" /> Create Class
              </CardTitle>
              <CardDescription>Generates a unique 6-character code for students.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createClassAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input id="name" name="name" placeholder="e.g. AP Physics 101" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="e.g. Fall Semester Physics" />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create Classroom
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Teacher Classes List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" /> Active Classrooms ({teacherClasses.length})
            </h2>
            {teacherClasses.length === 0 ? (
              <Card className="p-8 text-center bg-white/50 dark:bg-black/40">
                <p className="text-muted-foreground">You haven't created any classrooms yet.</p>
              </Card>
            ) : (
              teacherClasses.map((cls) => (
                <Card key={cls.id} className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-slate-200 dark:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-xl">{cls.name}</CardTitle>
                      <CardDescription>{cls.description || "No description provided."}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-mono font-bold text-sm">
                      <KeyRound className="w-4 h-4" /> Code: {cls.join_code}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
                      <Users className="w-4 h-4" />
                      <span>{cls.class_members?.length || 0} Student(s) Enrolled</span>
                    </div>
                    {cls.class_members?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cls.class_members.map((m: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-xs font-medium">
                            <UserCheck className="w-3 h-3 text-emerald-500" /> {m.profiles?.full_name || 'Student'}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Student Join Form */}
          <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-500" /> Join Classroom
              </CardTitle>
              <CardDescription>Enter the 6-character code given by your teacher.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={joinClassAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Class Code</Label>
                  <Input id="joinCode" name="joinCode" placeholder="e.g. K7M9P2" required className="font-mono uppercase tracking-widest text-center text-lg font-bold" />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Join Class
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Student Classes List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" /> My Classes ({studentEnrollments.length})
            </h2>
            {studentEnrollments.length === 0 ? (
              <Card className="p-8 text-center bg-white/50 dark:bg-black/40">
                <p className="text-muted-foreground">You are not enrolled in any classes yet. Use the code form to join!</p>
              </Card>
            ) : (
              studentEnrollments.map((enr, idx) => (
                <Card key={idx} className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-slate-200 dark:border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{enr.classes?.name}</CardTitle>
                      <CardDescription>Teacher: {enr.classes?.profiles?.full_name || 'Teacher'}</CardDescription>
                    </div>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
