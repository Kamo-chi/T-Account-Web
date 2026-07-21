'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getMinhasPermissoes, MinhaPermissao } from '@/lib/api'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

const ROLE_LABEL: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  editor: 'Editor',
  leitor: 'Leitor',
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null)
  const [nome, setNome] = useState('')
  const [permissoes, setPermissoes] = useState<MinhaPermissao[]>([])
  const [loading, setLoading] = useState(true)

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaErro, setSenhaErro] = useState<string | null>(null)
  const [senhaSucesso, setSenhaSucesso] = useState<string | null>(null)
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  const [nomeSalvando, setNomeSalvando] = useState(false)
  const [nomeSucesso, setNomeSucesso] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setNome((data.user?.user_metadata?.nome as string) ?? '')
      try {
        const perms = await getMinhasPermissoes()
        setPermissoes(perms)
      } catch (e) {
        console.error('Falha ao carregar permissões:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSalvarNome(e: React.FormEvent) {
    e.preventDefault()
    setNomeSucesso(null)
    setNomeSalvando(true)
    const { error } = await supabase.auth.updateUser({ data: { nome } })
    setNomeSalvando(false)
    if (error) {
      setNomeSucesso(null)
      return
    }
    setNomeSucesso('Perfil atualizado.')
  }

  async function handleTrocarSenha(e: React.FormEvent) {
    e.preventDefault()
    setSenhaErro(null)
    setSenhaSucesso(null)

    if (novaSenha.length < 8) {
      setSenhaErro('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaErro('As senhas não coincidem.')
      return
    }

    setSalvandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setSalvandoSenha(false)

    if (error) {
      setSenhaErro(error.message)
      return
    }
    setSenhaSucesso('Senha alterada com sucesso.')
    setNovaSenha('')
    setConfirmarSenha('')
  }

  if (loading) {
    return <div className="p-6 text-sm text-text-dim">Carregando...</div>
  }

  return (
    <div className="p-6 max-w-2xl flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold text-text mb-1">Perfil do usuário</h1>
        <p className="text-sm text-text-dim">{user?.email}</p>
      </div>

      {/* Dados do perfil */}
      <form onSubmit={handleSalvarNome} className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-text">Dados do perfil</h2>
        <label className="text-xs text-text-dim">Nome</label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
        <label className="text-xs text-text-dim">E-mail</label>
        <Input value={user?.email ?? ''} disabled />
        {nomeSucesso && <span className="text-xs text-accent">{nomeSucesso}</span>}
        <Button type="submit" variant="primary" size="sm" disabled={nomeSalvando} className="self-start">
          {nomeSalvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>

      {/* Permissões e acessos */}
      <div className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-text">Permissões e acessos</h2>
        {permissoes.length === 0 ? (
          <p className="text-xs text-text-dim">Nenhuma organização vinculada.</p>
        ) : (
          <table className="text-sm text-text w-full">
            <thead>
              <tr className="text-left text-xs text-text-dim border-b border-border-soft">
                <th className="py-1.5 font-normal">Organização</th>
                <th className="py-1.5 font-normal">Nível de acesso</th>
              </tr>
            </thead>
            <tbody>
              {permissoes.map((p) => (
                <tr key={p.organizacao_id} className="border-b border-border-soft last:border-0">
                  <td className="py-1.5">{p.organizacao_nome}</td>
                  <td className="py-1.5">{ROLE_LABEL[p.role] ?? p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Troca de senha */}
      <form onSubmit={handleTrocarSenha} className="bg-panel border border-border rounded-lg p-4 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-text">Alterar senha</h2>
        <label className="text-xs text-text-dim">Nova senha</label>
        <Input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
        />
        <label className="text-xs text-text-dim">Confirmar nova senha</label>
        <Input
          type="password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          placeholder="Repita a nova senha"
          required
        />
        {senhaErro && <span className="text-xs text-danger">{senhaErro}</span>}
        {senhaSucesso && <span className="text-xs text-accent">{senhaSucesso}</span>}
        <Button type="submit" variant="primary" size="sm" disabled={salvandoSenha} className="self-start">
          {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </form>
    </div>
  )
}
