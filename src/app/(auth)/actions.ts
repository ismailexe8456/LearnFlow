'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

function getErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback
  if (typeof err === 'string' && err.trim() && err !== '{}') return err
  
  const msg = err.message || err.error_description || err.msg
  if (typeof msg === 'string' && msg.trim() && msg !== '{}') {
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      return 'An account with this email already exists. Please sign in instead.'
    }
    return msg
  }

  if (err.code === 'user_already_exists') {
    return 'An account with this email already exists. Please sign in instead.'
  }

  return fallback
}

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
    const errorMsg = getErrorMessage(error, 'Invalid email or password.')
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

  const { data: signUpData, error } = await supabase.auth.signUp({
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
    const errorMsg = getErrorMessage(error, 'Registration failed. Please try a different email or password.')
    redirect(`/register?error=${encodeURIComponent(errorMsg)}`)
  }

  // Check if user already exists in Supabase (identities array is empty)
  if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
    redirect(`/login?error=${encodeURIComponent('An account with this email already exists. Please sign in instead.')}`)
  }

  // Attempt auto sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    redirect(`/login?error=${encodeURIComponent('Account created successfully! Please sign in with your email and password.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
