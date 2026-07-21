import { supabase } from './supabaseClient'
import { Grupo, Item, Descricao, Lancamento, Malote, Configuracoes, Role } from './types'

async function currentUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id
}

// Grupos
export async function getGrupos() {
  const { data, error } = await supabase.from('grupos').select('*').order('ordem')
  if (error) throw error
  return data as Grupo[]
}
export async function createGrupo(input: Omit<Grupo, 'id' | 'user_id'>) {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('grupos').insert({ ...input, user_id }).select().single()
  if (error) throw error
  return data as Grupo
}
export async function updateGrupo(id: string, patch: Partial<Grupo>) {
  const { data, error } = await supabase.from('grupos').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Grupo
}
export async function deleteGrupo(id: string) {
  const { error } = await supabase.from('grupos').delete().eq('id', id)
  if (error) throw error
}

// Itens (fornecedores)
export async function getItens() {
  const { data, error } = await supabase.from('itens').select('*').order('nome')
  if (error) throw error
  return data as Item[]
}
export async function createItem(input: Omit<Item, 'id' | 'user_id'>) {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('itens').insert({ ...input, user_id }).select().single()
  if (error) throw error
  return data as Item
}

// Descrições
export async function getDescricoes() {
  const { data, error } = await supabase.from('descricoes').select('*').order('descricao')
  if (error) throw error
  return data as Descricao[]
}
export async function createDescricao(input: Omit<Descricao, 'id' | 'user_id'>) {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('descricoes').insert({ ...input, user_id }).select().single()
  if (error) throw error
  return data as Descricao
}

// Malotes
export async function getMalotes() {
  const { data, error } = await supabase.from('malotes').select('*').order('data')
  if (error) throw error
  return data as Malote[]
}
export async function createMalote(input: Omit<Malote, 'id' | 'user_id'>) {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('malotes').insert({ ...input, user_id }).select().single()
  if (error) throw error
  return data as Malote
}

// Lançamentos
export async function getLancamentos() {
  const { data, error } = await supabase.from('lancamentos').select('*').order('data')
  if (error) throw error
  return data as Lancamento[]
}
export async function createLancamento(input: Omit<Lancamento, 'id' | 'user_id' | 'numero'>) {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('lancamentos').insert({ ...input, user_id }).select().single()
  if (error) throw error
  return data as Lancamento
}
export async function deleteLancamento(id: string) {
  const { error } = await supabase.from('lancamentos').delete().eq('id', id)
  if (error) throw error
}

// Configurações
export async function getConfiguracoes() {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('configuracoes').select('*').eq('user_id', user_id).single()
  if (error) throw error
  return data as Configuracoes
}
export async function updateConfiguracoes(patch: Partial<Configuracoes>) {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('configuracoes').update(patch).eq('user_id', user_id).select().single()
  if (error) throw error
  return data as Configuracoes
}

// Permissões
export async function getMyRole(): Promise<Role> {
  const user_id = await currentUserId()
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', user_id).single()
  if (error) throw error
  return data.role as Role
}
