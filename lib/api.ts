import { supabase } from './supabaseClient'
import { Grupo, Item, Descricao, Lancamento, Malote, Configuracoes, Role } from './types'

// workspaceId deve vir do WorkspaceContext (useWorkspace().workspaceAtivo.id)

// Grupos
export async function getGrupos(workspaceId: string) {
  const { data, error } = await supabase
    .from('grupos')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('ordem')
  if (error) throw error
  return data as Grupo[]
}
export async function createGrupo(workspaceId: string, input: Omit<Grupo, 'id' | 'workspace_id'>) {
  const { data, error } = await supabase
    .from('grupos')
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single()
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
export async function getItens(workspaceId: string) {
  const { data, error } = await supabase
    .from('itens')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('nome')
  if (error) throw error
  return data as Item[]
}
export async function createItem(workspaceId: string, input: Omit<Item, 'id' | 'workspace_id'>) {
  const { data, error } = await supabase
    .from('itens')
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single()
  if (error) throw error
  return data as Item
}

// Descrições
export async function getDescricoes(workspaceId: string) {
  const { data, error } = await supabase
    .from('descricoes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('descricao')
  if (error) throw error
  return data as Descricao[]
}
export async function createDescricao(
  workspaceId: string,
  input: Omit<Descricao, 'id' | 'workspace_id'>
) {
  const { data, error } = await supabase
    .from('descricoes')
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single()
  if (error) throw error
  return data as Descricao
}

// Malotes
export async function getMalotes(workspaceId: string) {
  const { data, error } = await supabase
    .from('malotes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('data')
  if (error) throw error
  return data as Malote[]
}
export async function createMalote(workspaceId: string, input: Omit<Malote, 'id' | 'workspace_id'>) {
  const { data, error } = await supabase
    .from('malotes')
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single()
  if (error) throw error
  return data as Malote
}

// Lançamentos
export async function getLancamentos(workspaceId: string) {
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('data')
  if (error) throw error
  return data as Lancamento[]
}
export async function createLancamento(
  workspaceId: string,
  input: Omit<Lancamento, 'id' | 'workspace_id' | 'numero'>
) {
  const { data, error } = await supabase
    .from('lancamentos')
    .insert({ ...input, workspace_id: workspaceId })
    .select()
    .single()
  if (error) throw error
  return data as Lancamento
}
export async function deleteLancamento(id: string) {
  const { error } = await supabase.from('lancamentos').delete().eq('id', id)
  if (error) throw error
}

// Configurações
export async function getConfiguracoes(workspaceId: string) {
  const { data, error } = await supabase
    .from('configuracoes')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()
  if (error) throw error
  return data as Configuracoes
}
export async function updateConfiguracoes(workspaceId: string, patch: Partial<Configuracoes>) {
  const { data, error } = await supabase
    .from('configuracoes')
    .update(patch)
    .eq('workspace_id', workspaceId)
    .select()
    .single()
  if (error) throw error
  return data as Configuracoes
}

// Permissões (por organização, via membros)
export async function getMyRole(organizacaoId: string): Promise<Role | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user?.id) return null
  const { data, error } = await supabase
    .from('membros')
    .select('role')
    .eq('organizacao_id', organizacaoId)
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (error) throw error
  return (data?.role as Role) ?? null
}

// Todas as permissões do usuário (todas as organizações em que é membro)
export interface MinhaPermissao {
  organizacao_id: string
  organizacao_nome: string
  role: Role
}
export async function getMinhasPermissoes(): Promise<MinhaPermissao[]> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user?.id) return []
  const { data, error } = await supabase
    .from('membros')
    .select('organizacao_id, role, organizacoes(nome)')
    .eq('user_id', userData.user.id)
  if (error) throw error
  return (data ?? []).map((m: any) => ({
    organizacao_id: m.organizacao_id,
    organizacao_nome: m.organizacoes?.nome ?? m.organizacao_id,
    role: m.role as Role,
  }))
}
