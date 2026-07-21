'use client'

import { useEffect, useState } from 'react'
import { getAccounts, getLinesByAccount } from '@/lib/api'
import { Account, JournalLine } from '@/lib/types'
import { TAccount } from '@/components/TAccount'
import { Button } from '@/components/Button'
import { NewEntryDialog } from '@/components/NewEntryDialog'

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [linesByAccount, setLinesByAccount] = useState<Record<string, JournalLine[]>>({})
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function load() {
    const accs = await getAccounts()
    setAccounts(accs)
    const entries = await Promise.all(accs.map((a) => getLinesByAccount(a.id)))
    const map: Record<string, JournalLine[]> = {}
    accs.forEach((a, i) => (map[a.id] = entries[i]))
    setLinesByAccount(map)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
        <h1 className="text-sm font-medium text-text">Razonetes</h1>
        <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
          Novo lançamento
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 flex flex-wrap gap-4">
        {loading && <span className="text-xs text-text-faint">Carregando…</span>}
        {!loading && accounts.length === 0 && (
          <span className="text-xs text-text-faint">Nenhuma conta cadastrada.</span>
        )}
        {accounts.map((acc) => (
          <TAccount key={acc.id} account={acc} lines={linesByAccount[acc.id] || []} />
        ))}
      </main>
      {dialogOpen && (
        <NewEntryDialog accounts={accounts} onClose={() => setDialogOpen(false)} onCreated={load} />
      )}
    </div>
  )
}
