'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSuperAdmin } from '@/lib/useSuperAdmin'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

interface Organizacao {
  id: string
  nome: string
  limite_workspaces: number
  ativo: boolean
}

export default function SuperAdminOrganizacoesPage() {
  const { isSuperAdmin, loading: checkingAccess } = useSuperAdmin()
  const [orgs, setOrgs] = useState<Organizacao[]>([])
  const [loading, setLoading] = useState(true)
  const [editValues, setEditValues] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('organizacoes')
      .select('id, nome, limite_workspaces, ativo')
      .order('nome')
    if (!error && data) setOrgs(data)
    setLoading(false)
  }

  useEffect(() => {
    if (isSuperAdmin) load()
  }, [isSuperAdmin])

  async function handleSalvar(orgId: string) {
    const novoLimite = editValues[orgId]
    if (!novoLimite || novoLimite < 1) return
    setSaving(orgId)
    setError(null)
    const { error } = await supabase.rpc('update_limite_workspaces', {
      org_id: orgId,
      novo_limite: novoLimite,
    })
    setSaving(null)
    if (error) {
      setError(error.message)
      return
    }
    load()
  }

  if (checkingAccess) {
    return <div className="p-4 text-xs text-text-faint">Verificando acesso…</div>
  }

  if (!isSuperAdmin) {
    return <div className="p-4 text-xs text-danger">Acesso restrito a super administradores.</div>
  }

  return (
    <div className="h-full bg-bg p-4 flex flex-col gap-4">
      <h1 className="text-sm font-medium text-text">Organizações — limite de workspaces</h1>
      {error && <span className="text-xs text-danger">{error}</span>}
      {loading ? (
        <span className="text-xs text-text-faint">Carregando…</span>
      ) : (
        <table className="text-xs text-text-dim w-full max-w-2xl">
          <thead>
            <tr className="text-left border-b border-border-soft">
              <th className="py-2">Organização</th>
              <th className="py-2">Status</th>
              <th className="py-2">Limite atual</th>
              <th className="py-2">Novo limite</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-b border-border-soft">
                <td className="py-2">{org.nome}</td>
                <td className="py-2">{org.ativo ? 'ativo' : 'inativo'}</td>
                <td className="py-2 font-mono">{org.limite_workspaces}</td>
                <td className="py-2">
                  <Input
                    type="number"
                    className="w-20"
                    placeholder={String(org.limite_workspaces)}
                    onChange={(e) =>
                      setEditValues((prev) => ({ ...prev, [org.id]: Number(e.target.value) }))
                    }
                  />
                </td>
                <td className="py-2">
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={saving === org.id}
                    onClick={() => handleSalvar(org.id)}
                  >
                    {saving === org.id ? 'Salvando…' : 'Salvar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
