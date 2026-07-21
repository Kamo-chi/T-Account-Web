'use client'

import { useEffect, useState } from 'react'
import { getMyRole } from './api'
import { Role } from './types'
import { useWorkspace } from './WorkspaceContext'

export function useRole() {
  const { organizacaoAtiva } = useWorkspace()
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!organizacaoAtiva) {
      setLoading(false)
      return
    }
    setLoading(true)
    getMyRole(organizacaoAtiva.id)
      .then((r) => setRole(r))
      .catch(() => setRole(null))
      .finally(() => setLoading(false))
  }, [organizacaoAtiva])

  return {
    role,
    loading,
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    canEdit: role === 'owner' || role === 'admin' || role === 'editor',
  }
}
