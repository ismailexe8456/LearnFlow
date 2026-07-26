'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Please enter both email and password.')}`)
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const errorMsg = error.message || 'Invalid login credentials'
    redirect(`/login?error=${encodeURIComponent(errorMsg)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'student'
  const fullName = (formData.get('fullName') as string)?.trim() || 'User'
  const dateOfBirth = (formData.get('dateOfBirth') as string)?.trim() || null

  if (!email || !password) {
    redirect(`/register?error=${encodeURIComponent('Email and password are required.')}`)
  }

  let isKidsMode = false
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth)
    if (!isNaN(dob.getTime())) {
      const ageDifMs = Date.now() - dob.getTime()
      const ageDate = new Date(ageDifMs)
      const age = Math.abs(ageDate.getUTCFullYear() - 1970)
      isKidsMode = age <= 12
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        date_of_birth: dateOfBirth,
        is_kids_mode: isKidsMode
      }
    }
  })

  if (error) {
    const errorMsg = error.message || 'Registration failed'
    redirect(`/register?error=${encodeURIComponent(errorMsg)}`)
  }

  // Attempt auto sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    redirect(`/login?error=${encodeURIComponent('Account created! Please sign in with your password.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
