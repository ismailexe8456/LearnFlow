import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TeacherDashboard } from '@/components/dashboard/views/teacher-view'
import { StudentDashboard } from '@/components/dashboard/views/student-view'
import { AdminDashboard } from '@/components/dashboard/views/admin-view'

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

  // Unified routing based on role
  if (profile.role === 'teacher') {
    return <TeacherDashboard profile={profile} />
  } else if (profile.role === 'student') {
    return <StudentDashboard profile={profile} />
  } else if (profile.role === 'admin') {
    return <AdminDashboard profile={profile} />
  }

  return <div>Unknown role</div>
}
