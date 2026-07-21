'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabaseClient'

interface Organizacao {
  id: string
  nome: string
}
interface Workspace {
  id: string
  nome: string
  organizacao_id: string
}

interface WorkspaceContextValue {
  organizacoes: Organizacao[]
  workspaces: Workspace[]
  organizacaoAtiva: Organizacao | null
  workspaceAtivo: Workspace | null
  setOrganizacaoAtiva: (org: Organizacao) => void
  setWorkspaceAtivo: (ws: Workspace) => void
  loading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

const ORG_KEY = 'razonete:organizacao_id'
const WS_KEY = 'razonete:workspace_id'

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [organizacaoAtiva, setOrganizacaoAtivaState] = useState<Organizacao | null>(null)
  const [workspaceAtivo, setWorkspaceAtivoState] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: orgs, error: orgErr } = await supabase.from('organizacoes').select('id, nome')
      if (orgErr || !orgs || orgs.length === 0) {
        setLoading(false)
        return
      }
      setOrganizacoes(orgs)

      const storedOrgId = localStorage.getItem(ORG_KEY)
      const org = orgs.find((o) => o.id === storedOrgId) ?? orgs[0]
      setOrganizacaoAtivaState(org)

      const { data: ws } = await supabase
        .from('workspaces')
        .select('id, nome, organizacao_id')
        .eq('organizacao_id', org.id)

      const list = ws ?? []
      setWorkspaces(list)

      const storedWsId = localStorage.getItem(WS_KEY)
      const activeWs = list.find((w) => w.id === storedWsId) ?? list[0] ?? null
      setWorkspaceAtivoState(activeWs)
      setLoading(false)
    }
    load()
  }, [])

  async function setOrganizacaoAtiva(org: Organizacao) {
    setOrganizacaoAtivaState(org)
    localStorage.setItem(ORG_KEY, org.id)
    const { data: ws } = await supabase
      .from('workspaces')
      .select('id, nome, organizacao_id')
      .eq('organizacao_id', org.id)
    const list = ws ?? []
    setWorkspaces(list)
    const next = list[0] ?? null
    setWorkspaceAtivoState(next)
    if (next) localStorage.setItem(WS_KEY, next.id)
  }

  function setWorkspaceAtivo(ws: Workspace) {
    setWorkspaceAtivoState(ws)
    localStorage.setItem(WS_KEY, ws.id)
  }

  return (
    <WorkspaceContext.Provider
      value={{
        organizacoes,
        workspaces,
        organizacaoAtiva,
        workspaceAtivo,
        setOrganizacaoAtiva,
        setWorkspaceAtivo,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace deve ser usado dentro de WorkspaceProvider')
  return ctx
}
