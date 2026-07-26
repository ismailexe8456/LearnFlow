import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings, ShieldCheck, User } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Settings className="w-8 h-8 text-indigo-500" /> Account Settings
        </h1>
        <p className="text-muted-foreground">Manage your profile and platform preferences.</p>
      </div>

      <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Your registered Supabase account info.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={profile?.full_name || ''} readOnly className="bg-slate-100 dark:bg-slate-900" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ''} readOnly className="bg-slate-100 dark:bg-slate-900" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={profile?.role || 'student'} readOnly className="bg-slate-100 dark:bg-slate-900 capitalize" />
          </div>
          {profile?.is_admin && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500 font-bold">
                <ShieldCheck className="w-5 h-5" /> Admin Privilege Enabled
              </div>
              <Link href="/holyairballbonga">
                <Button variant="destructive" size="sm">Go to /holyairballbonga</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
