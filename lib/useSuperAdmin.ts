'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data, error } = await supabase.rpc('is_super_admin')
      if (error) {
        console.error('Falha ao verificar super admin:', error.message)
      }
      setIsSuperAdmin(!error && Boolean(data))
      setLoading(false)
    }
    check()
  }, [])

  return { isSuperAdmin, loading }
}
