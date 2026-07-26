import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { FlashcardsClient } from './flashcard-client'

export default async function FlashcardsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: decks } = await supabase
    .from('flashcard_decks')
    .select('*, flashcards(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <FlashcardsClient initialDecks={decks || []} userId={user.id} />
}
