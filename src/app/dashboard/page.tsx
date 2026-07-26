import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TeacherDashboard } from '@/components/dashboard/views/teacher-view'
import { StudentDashboard } from '@/components/dashboard/views/student-view'

export default async function DashboardPage() {
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

  if (!profile) {
    redirect('/login')
  }

  // Redirect admin directly to the holyairballbonga admin panel or show role dashboard
  if (profile.is_admin) {
    // Admins can view holyairballbonga or standard role view
  }

  if (profile.role === 'teacher') {
    // Real counts for teacher
    const [{ count: classCount }, { count: quizCount }] = await Promise.all([
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id),
      supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id),
    ])

    return (
      <TeacherDashboard 
        profile={profile} 
        stats={{
          classCount: classCount ?? 0,
          quizCount: quizCount ?? 0,
        }} 
      />
    )
  } else {
    // Real counts for student
    const [{ count: enrolledCount }, { count: deckCount }] = await Promise.all([
      supabase.from('class_members').select('*', { count: 'exact', head: true }).eq('student_id', user.id),
      supabase.from('flashcard_decks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    return (
      <StudentDashboard 
        profile={profile} 
        stats={{
          enrolledCount: enrolledCount ?? 0,
          deckCount: deckCount ?? 0,
        }} 
      />
    )
  }
}
