'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, FolderCog, LogOut, ShieldCheck, UserCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useWorkspace } from '@/lib/WorkspaceContext'
import { useSuperAdmin } from '@/lib/useSuperAdmin'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutGrid
  modulo: 'razonete' | 'pdf_organizer'
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Razonete', icon: LayoutGrid, modulo: 'razonete' },
  { href: '/cadastros', label: 'Cadastros', icon: FolderCog, modulo: 'razonete' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    organizacoes,
    workspaces,
    organizacaoAtiva,
    workspaceAtivo,
    setOrganizacaoAtiva,
    setWorkspaceAtivo,
  } = useWorkspace()
  const { isSuperAdmin } = useSuperAdmin()

  const [modulosHabilitados, setModulosHabilitados] = useState<Set<string>>(new Set(['razonete']))

  useEffect(() => {
    async function loadModulos() {
      if (!organizacaoAtiva) return
      const { data } = await supabase
        .from('organizacao_modulos')
        .select('modulo, habilitado')
        .eq('organizacao_id', organizacaoAtiva.id)
      const habilitados = new Set(
        (data ?? []).filter((m) => m.habilitado).map((m) => m.modulo as string)
      )
      // razonete sempre disponível por padrão se não houver registro explícito
      if (!data || data.length === 0) habilitados.add('razonete')
      setModulosHabilitados(habilitados)
    }
    loadModulos()
  }, [organizacaoAtiva])

  const navFiltrado = NAV_ITEMS.filter((item) => modulosHabilitados.has(item.modulo))

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 h-screen bg-panel border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border-soft flex flex-col gap-2">
        <span className="text-sm font-semibold text-text">Razonete Web</span>

        {organizacoes.length > 1 && (
          <select
            value={organizacaoAtiva?.id ?? ''}
            onChange={(e) => {
              const org = organizacoes.find((o) => o.id === e.target.value)
              if (org) setOrganizacaoAtiva(org)
            }}
            className="bg-panel-raised border border-border rounded text-xs text-text px-2 py-1"
          >
            {organizacoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        )}

        {workspaces.length > 0 && (
          <select
            value={workspaceAtivo?.id ?? ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value)
              if (ws) setWorkspaceAtivo(ws)
            }}
            className="bg-panel-raised border border-border rounded text-xs text-text px-2 py-1"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-2">
        {navFiltrado.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? 'bg-accent-soft text-accent' : 'text-text hover:bg-panel-raised'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}

        {isSuperAdmin && (
          <Link
            href="/super-admin/organizacoes"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors mt-2 border-t border-border-soft pt-3 ${
              pathname?.startsWith('/super-admin')
                ? 'bg-accent-soft text-accent'
                : 'text-text hover:bg-panel-raised'
            }`}
          >
            <ShieldCheck size={15} />
            Super Admin
          </Link>
        )}
      </nav>
      <div className="p-2 border-t border-border-soft flex flex-col gap-1">
        <Link
          href="/perfil"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname?.startsWith('/perfil') ? 'bg-accent-soft text-accent' : 'text-text hover:bg-panel-raised'
          }`}
        >
          <UserCircle size={15} />
          Perfil
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-text-dim hover:bg-panel-raised hover:text-text w-full"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
