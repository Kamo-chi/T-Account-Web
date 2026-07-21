'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Account } from '@/lib/types'
import { createJournalEntry } from '@/lib/api'

interface LineDraft {
  account_id: string
  debit: string
  credit: string
}

interface NewEntryDialogProps {
  accounts: Account[]
  onClose: () => void
  onCreated: () => void
}

export function NewEntryDialog({ accounts, onClose, onCreated }: NewEntryDialogProps) {
  const [description, setDescription] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [lines, setLines] = useState<LineDraft[]>([
    { account_id: '', debit: '', credit: '' },
    { account_id: '', debit: '', credit: '' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  function addLine() {
    setLines((prev) => [...prev, { account_id: '', debit: '', credit: '' }])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = lines
      .filter((l) => l.account_id)
      .map((l) => ({
        account_id: l.account_id,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
      }))

    const totalDebit = parsed.reduce((s, l) => s + l.debit, 0)
    const totalCredit = parsed.reduce((s, l) => s + l.credit, 0)

    if (parsed.length < 2) {
      setError('Informe ao menos duas linhas.')
      return
    }
    if (totalDebit !== totalCredit) {
      setError(`Débito (${totalDebit}) diferente de crédito (${totalCredit}).`)
      return
    }

    setSaving(true)
    try {
      await createJournalEntry(description, entryDate, parsed)
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
          <Input placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} mono />

          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={line.account_id}
                onChange={(e) => updateLine(i, { account_id: e.target.value })}
                className="bg-panel-raised border border-border rounded text-sm text-text px-2 py-2 flex-1"
              >
                <option value="">Conta…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <Input
                mono
                type="number"
                placeholder="Débito"
                value={line.debit}
                onChange={(e) => updateLine(i, { debit: e.target.value })}
                className="w-24"
              />
              <Input
                mono
                type="number"
                placeholder="Crédito"
                value={line.credit}
                onChange={(e) => updateLine(i, { credit: e.target.value })}
                className="w-24"
              />
              <button type="button" onClick={() => removeLine(i)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-panel-raised">
                <Trash2 size={14} className="text-danger" />
              </button>
            </div>
          ))}

          <Button type="button" variant="subtle" size="sm" onClick={addLine} className="self-start flex items-center gap-1">
            <Plus size={13} /> Adicionar linha
          </Button>

          {error && <span className="text-xs text-danger">{error}</span>}
        </form>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border-soft">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
