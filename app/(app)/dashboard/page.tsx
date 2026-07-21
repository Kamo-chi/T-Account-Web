'use client'

import { useEffect, useState } from 'react'
import { getGrupos, getLancamentos, getMalotes, getItens, getDescricoes } from '@/lib/api'
import { montarRazonete, BlocoGrupo } from '@/lib/razoneteEngine'
import { Grupo, Item, Descricao, Malote } from '@/lib/types'
import { Button } from '@/components/Button'
import { NewLancamentoDialog } from '@/components/NewLancamentoDialog'
import { useWorkspace } from '@/lib/WorkspaceContext'

export default function DashboardPage() {
  const { workspaceAtivo, loading: workspaceLoading } = useWorkspace()
  const [blocos, setBlocos] = useState<BlocoGrupo[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [itens, setItens] = useState<Item[]>([])
  const [descricoes, setDescricoes] = useState<Descricao[]>([])
  const [malotes, setMalotes] = useState<Malote[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function load(workspaceId: string) {
    setLoading(true)
    const [g, lancamentos, m, i, d] = await Promise.all([
      getGrupos(workspaceId),
      getLancamentos(workspaceId),
      getMalotes(workspaceId),
      getItens(workspaceId),
      getDescricoes(workspaceId),
    ])
    setGrupos(g)
    setItens(i)
    setDescricoes(d)
    setMalotes(m)
    setBlocos(montarRazonete(g, lancamentos, m, i, d))
    setLoading(false)
  }

  useEffect(() => {
    if (workspaceAtivo) load(workspaceAtivo.id)
  }, [workspaceAtivo])

  if (workspaceLoading) {
    return <div className="p-4 text-xs text-text-faint">Carregando workspace…</div>
  }

  if (!workspaceAtivo) {
    return <div className="p-4 text-xs text-text-faint">Nenhum workspace disponível.</div>
  }

  return (
    <div className="h-full flex flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
        <h1 className="text-sm font-medium text-text">Razonete</h1>
        <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
          Novo lançamento
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 flex flex-wrap gap-4">
        {loading && <span className="text-xs text-text-faint">Carregando…</span>}
        {!loading && blocos.length === 0 && (
          <span className="text-xs text-text-faint">Nenhum grupo cadastrado. Vá em Cadastros.</span>
        )}
        {blocos.map((b) => (
          <div key={b.grupo.id} className="bg-panel border border-border rounded-lg p-3 w-72">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text">{b.grupo.nome}</span>
              <span className="topic-seal">{b.grupo.tipo}</span>
            </div>
            <div className="flex flex-col gap-1">
              {b.linhas.map((l) => (
                <div key={l.refId + l.tipo} className={`flex justify-between text-xs font-mono ${l.tipo === 'malote-item' ? 'pl-3 text-text-faint' : 'text-text-dim'}`}>
                  <span className="truncate">{l.descricao}</span>
                  <span>{l.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
            {b.grupo.mostrar_total && (
              <div className="border-t border-border-soft mt-2 pt-1 text-right text-xs font-mono text-accent">
                Total: {b.total.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </main>
      {dialogOpen && (
        <NewLancamentoDialog
          workspaceId={workspaceAtivo.id}
          grupos={grupos}
          itens={itens}
          descricoes={descricoes}
          malotes={malotes}
          onClose={() => setDialogOpen(false)}
          onCreated={() => load(workspaceAtivo.id)}
        />
      )}
    </div>
  )
}
