'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { CurrencyInput } from './CurrencyInput'
import { Grupo, Item, Descricao, Malote } from '@/lib/types'
import { createLancamento } from '@/lib/api'

interface NewLancamentoDialogProps {
  workspaceId: string
  grupos: Grupo[]
  itens: Item[]
  descricoes: Descricao[]
  malotes: Malote[]
  onClose: () => void
  onCreated: () => void
}

export function NewLancamentoDialog({ workspaceId, grupos, itens, descricoes, malotes, onClose, onCreated }: NewLancamentoDialogProps) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [documento, setDocumento] = useState('')
  const [grupoId, setGrupoId] = useState('')
  const [itemId, setItemId] = useState('')
  const [descricaoId, setDescricaoId] = useState('')
  const [maloteId, setMaloteId] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [observacao, setObservacao] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const malotesDoGrupo = malotes.filter((m) => m.grupo_id === grupoId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!grupoId || !itemId || !descricaoId || !valor) {
      setError('Preencha grupo, item, descrição e valor.')
      return
    }

    setSaving(true)
    try {
      await createLancamento(workspaceId, {
        data,
        documento,
        grupo_id: grupoId,
        item_id: itemId,
        descricao_id: descricaoId,
        malote_id: maloteId || null,
        valor: Number(valor),
        observacao,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-panel border border-border rounded-lg shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-soft">
          <h2 className="text-sm font-medium text-text">Novo lançamento</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-panel-raised">
            <X size={15} className="text-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-4 py-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <Input type="date" mono value={data} onChange={(e) => setData(e.target.value)} className="flex-1" />
            <Input placeholder="Documento" value={documento} onChange={(e) => setDocumento(e.target.value)} className="flex-1" />
          </div>

          <select
            value={grupoId}
            onChange={(e) => { setGrupoId(e.target.value); setMaloteId('') }}
            className="bg-panel-raised border border-border rounded text-sm text-text px-2 py-2"
          >
            <option value="">Grupo…</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>

          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="bg-panel-raised border border-border rounded text-sm text-text px-2 py-2"
          >
            <option value="">Item / fornecedor…</option>
            {itens.map((i) => (
              <option key={i.id} value={i.id}>{i.nome}</option>
            ))}
          </select>

          <select
            value={descricaoId}
            onChange={(e) => setDescricaoId(e.target.value)}
            className="bg-panel-raised border border-border rounded text-sm text-text px-2 py-2"
          >
            <option value="">Descrição…</option>
            {descricoes.map((d) => (
              <option key={d.id} value={d.id}>{d.descricao}</option>
            ))}
          </select>

          {grupoId && (
            <select
              value={maloteId}
              onChange={(e) => setMaloteId(e.target.value)}
              className="bg-panel-raised border border-border rounded text-sm text-text px-2 py-2"
            >
              <option value="">Sem malote (lançamento avulso)</option>
              {malotesDoGrupo.map((m) => (
                <option key={m.id} value={m.id}>{m.descricao}</option>
              ))}
            </select>
          )}

          <CurrencyInput value={valor} onChange={setValor} />
          <Input placeholder="Observação (opcional)" value={observacao} onChange={(e) => setObservacao(e.target.value)} />

          {error && <span className="text-xs text-danger">{error}</span>}
        </form>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border-soft">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
