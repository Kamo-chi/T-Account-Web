export type AccountType = 'ativo' | 'passivo' | 'patrimonio' | 'receita' | 'despesa'

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  description: string | null
  entry_date: string
  created_at: string
}

export interface JournalLine {
  id: string
  journal_entry_id: string
  account_id: string
  debit: number
  credit: number
  created_at: string
}
