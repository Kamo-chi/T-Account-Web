'use client'

import { useEffect, useState } from 'react'
import { getGrupos, createGrupo, getItens, createItem, getDescricoes, createDescricao } from '@/lib/api'
import { Grupo, Item, Descricao, TipoGrupo } from '@/lib/types'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function CadastrosPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [itens, setItens] = useState<Item[]>([])
  const [descricoes, setDescricoes] = useState<Descricao[]>([])

  const [novoGrupo, setNovoGrupo] = useState('')
  const [tipoGrupo, setTipoGrupo] = useState<TipoGrupo>('entrada')
  const [novoItem, setNovoItem] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')

  async function loadAll() {
    setGrupos(await getGrupos())
    setItens(await getItens())
    setDescricoes(await getDescricoes())
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleAddGrupo(e: React.FormEvent) {
    e.preventDefault()
    if (!novoGrupo.trim()) return
    await createGrupo({
      nome: novoGrupo,
      ordem: grupos.length,
      ativo: true,
      mostrar_total: true,
      tipo: tipoGrupo,
      calcular_no_saldo: true,
    })
    setNovoGrupo('')
    loadAll()
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    if (!novoItem.trim()) return
    await createItem({ nome: novoItem, cnpj: null, ativo: true })
    setNovoItem('')
    loadAll()
  }

  async function handleAddDescricao(e: React.FormEvent) {
    e.preventDefault()
    if (!novaDescricao.trim()) return
    await createDescricao({ descricao: novaDescricao, ativo: true })
    setNovaDescricao('')
    loadAll()
  }

  return (
    <div className="h-full bg-bg p-4 flex flex-col gap-6">
      <h1 className="text-sm font-medium text-text">Cadastros base</h1>

      <section className="bg-panel border border-border rounded-lg p-4 max-w-md">
        <h2 className="text-sm font-medium text-text mb-3">Grupos</h2>
        <form onSubmit={handleAddGrupo} className="flex gap-2 mb-3">
          <Input placeholder="Nome do grupo" value={novoGrupo} onChange={(e) => setNovoGrupo(e.target.value)} className="flex-1" />
          <select
            value={tipoGrupo}
            onChange={(e) => setTipoGrupo(e.target.value as TipoGrupo)}
            className="bg-panel-raised border border-border rounded text-sm text-text px-2"
          >
            <option value="entrada">Entrada</option>
            <option value="despesa">Despesa</option>
          </select>
          <Button type="submit" variant="primary" size="sm">Adicionar</Button>
        </form>
        <ul className="flex flex-col gap-1">
          {grupos.map((g) => (
            <li key={g.id} className="flex justify-between text-xs text-text-dim">
              <span>{g.nome}</span>
              <span className="topic-seal">{g.tipo}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-panel border border-border rounded-lg p-4 max-w-md">
        <h2 className="text-sm font-medium text-text mb-3">Itens (fornecedores)</h2>
        <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
          <Input placeholder="Nome do fornecedor" value={novoItem} onChange={(e) => setNovoItem(e.target.value)} className="flex-1" />
          <Button type="submit" variant="primary" size="sm">Adicionar</Button>
        </form>
        <ul className="flex flex-col gap-1">
          {itens.map((i) => (
            <li key={i.id} className="text-xs text-text-dim">{i.nome}</li>
          ))}
        </ul>
      </section>

      <section className="bg-panel border border-border rounded-lg p-4 max-w-md">
        <h2 className="text-sm font-medium text-text mb-3">Descrições</h2>
        <form onSubmit={handleAddDescricao} className="flex gap-2 mb-3">
          <Input placeholder="Descrição padronizada" value={novaDescricao} onChange={(e) => setNovaDescricao(e.target.value)} className="flex-1" />
          <Button type="submit" variant="primary" size="sm">Adicionar</Button>
        </form>
        <ul className="flex flex-col gap-1">
          {descricoes.map((d) => (
            <li key={d.id} className="text-xs text-text-dim">{d.descricao}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
