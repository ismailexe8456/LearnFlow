import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  const isKidsMode = profile.is_kids_mode

  return (
    <div className={`flex h-screen overflow-hidden ${isKidsMode ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-slate-50 dark:bg-slate-950'}`}>
      <Sidebar role={profile.role} isKidsMode={isKidsMode} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar userProfile={profile} />
        
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ${isKidsMode ? 'font-comic' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
