import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Client-side authentication functions
 */
export async function signUp(
  email: string,
  password: string,
  options: {
    firstName?: string
    lastName?: string
    role?: 'patient' | 'hospital' | 'insurer' | 'admin'
  } = {},
) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      data: {
        first_name: options.firstName || '',
        last_name: options.lastName || '',
        role: options.role || 'patient',
      },
    },
  })

  return { data, error }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
      `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
  })

  return { data, error }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  return { data, error }
}

/**
 * Server-side authentication functions
 */
export async function getUser() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
}

export async function getSession() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { profile: data, error }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string
    email?: string
    role?: string
  },
) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { profile: data, error }
}
