'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .rpc('is_super_admin')
      .then(({ data }) => setIsSuperAdmin(Boolean(data)))
      .finally(() => setLoading(false))
  }, [])

  return { isSuperAdmin, loading }
}
