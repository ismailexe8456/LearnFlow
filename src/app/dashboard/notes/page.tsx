import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NotebookNotesClient } from './notes-client'

export default async function NotesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <NotebookNotesClient initialDocuments={documents || []} userId={user.id} />
}
