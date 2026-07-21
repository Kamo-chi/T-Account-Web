'use client'

import { useEffect, useState } from 'react'
import { getMyRole } from './api'
import { Role } from './types'

export function useRole() {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyRole()
      .then(setRole)
      .catch(() => setRole(null))
      .finally(() => setLoading(false))
  }, [])

  return { role, loading, isAdmin: role === 'admin', canEdit: role === 'admin' || role === 'editor' }
}
