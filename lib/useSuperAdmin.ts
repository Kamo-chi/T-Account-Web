'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data } = await supabase.rpc('is_super_admin')
      setIsSuperAdmin(Boolean(data))
      setLoading(false)
    }
    check()
  }, [])

  return { isSuperAdmin, loading }
}
