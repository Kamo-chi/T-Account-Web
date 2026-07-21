export type TipoGrupo = 'entrada' | 'despesa'

export interface Grupo {
  id: string
  workspace_id: string
  nome: string
  ordem: number
  ativo: boolean
  mostrar_total: boolean
  tipo: TipoGrupo
  calcular_no_saldo: boolean
}

export interface Item {
  id: string
  workspace_id: string
  nome: string
  cnpj: string | null
  ativo: boolean
}

export interface Descricao {
  id: string
  workspace_id: string
  descricao: string
  ativo: boolean
}

export interface Malote {
  id: string
  workspace_id: string
  descricao: string
  data: string
  grupo_id: string
  valor_total: number
}

export interface Lancamento {
  id: string
  workspace_id: string
  numero: number
  data: string
  competencia?: string
  documento?: string
  item_id: string
  descricao_id: string
  grupo_id: string
  valor: number
  observacao?: string
  malote_id?: string | null
}

export type FormatoData = 'DD/MM/AAAA' | 'MM/DD/AAAA' | 'AAAA-MM-DD'

export interface Configuracoes {
  user_id: string
  workspace_id: string
  nome_projeto: string
  moeda: string
  formato_data: FormatoData
  subtitulo: string
  ocultar_data_emissao: boolean
}

export type Role = 'owner' | 'admin' | 'editor' | 'leitor'
