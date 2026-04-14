'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/types'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Get current user
  const getUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (err) {
      console.error('[v0] Error getting user:', err)
      return null
    }
  }, [supabase])

  // Get user profile
  const getProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (err) {
      console.error('[v0] Error getting profile:', err)
      return null
    }
  }, [supabase])

  // Initialize - check if user is logged in
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authUser = await getUser()
        setUser(authUser)

        if (authUser) {
          const userProfile = await getProfile(authUser.id)
          setProfile(userProfile)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth error')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const userProfile = await getProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, getUser, getProfile])

  return {
    user,
    profile,
    isLoading,
    error,
    isAuthenticated: !!user,
  }
}

export function useSupabaseTable<T extends Record<string, any>>(
  tableName: string,
  options?: {
    select?: string
    where?: Record<string, any>
    order?: { column: string; ascending?: boolean }
    limit?: number
  },
) {
  const [data, setData] = useState<T[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from(tableName).select(options?.select ?? '*')

        if (options?.where) {
          Object.entries(options.where).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }

        if (options?.order) {
          query = query.order(options.order.column, {
            ascending: options.order.ascending ?? true,
          })
        }

        if (options?.limit) {
          query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) throw error
        setData(data as T[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Query error')
        console.error('[v0] Error fetching table data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, tableName, options])

  return { data, isLoading, error }
}
