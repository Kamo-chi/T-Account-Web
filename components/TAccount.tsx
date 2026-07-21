import { JournalLine, Account } from '@/lib/types'

interface TAccountProps {
  account: Account
  lines: JournalLine[]
}

export function TAccount({ account, lines }: TAccountProps) {
  const totalDebit = lines.reduce((s, l) => s + Number(l.debit), 0)
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit), 0)
  const balance = totalDebit - totalCredit

  return (
    <div className="bg-panel border border-border rounded-lg p-3 w-64">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text">{account.name}</span>
        <span className="topic-seal">{account.type}</span>
      </div>
      <div className="grid grid-cols-2 border-t border-border-soft">
        <div className="border-r border-border-soft pr-2 py-1">
          {lines.filter((l) => l.debit > 0).map((l) => (
            <div key={l.id} className="text-xs font-mono text-text-dim text-right">
              {l.debit.toFixed(2)}
            </div>
          ))}
        </div>
        <div className="pl-2 py-1">
          {lines.filter((l) => l.credit > 0).map((l) => (
            <div key={l.id} className="text-xs font-mono text-text-dim">
              {l.credit.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border-soft mt-1 pt-1 text-right">
        <span className={`text-xs font-mono ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
          Saldo: {balance.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
