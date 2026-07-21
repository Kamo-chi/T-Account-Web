import { supabase } from './supabaseClient'
import { Account, JournalEntry, JournalLine } from './types'

export async function getAccounts() {
  const { data, error } = await supabase.from('accounts').select('*').order('created_at')
  if (error) throw error
  return data as Account[]
}

export async function createAccount(name: string, type: Account['type']) {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('accounts')
    .insert({ name, type, user_id: userData.user?.id })
    .select()
    .single()
  if (error) throw error
  return data as Account
}

export async function createJournalEntry(description: string, entryDate: string, lines: { account_id: string; debit: number; credit: number }[]) {
  const { data: userData } = await supabase.auth.getUser()
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .insert({ description, entry_date: entryDate, user_id: userData.user?.id })
    .select()
    .single()
  if (entryError) throw entryError

  const linesPayload = lines.map((l) => ({ ...l, journal_entry_id: entry.id }))
  const { error: linesError } = await supabase.from('journal_lines').insert(linesPayload)
  if (linesError) throw linesError

  return entry as JournalEntry
}

export async function getLinesByAccount(accountId: string) {
  const { data, error } = await supabase
    .from('journal_lines')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at')
  if (error) throw error
  return data as JournalLine[]
}
