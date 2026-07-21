'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, FolderCog, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Razonete', icon: LayoutGrid },
  { href: '/cadastros', label: 'Cadastros', icon: FolderCog },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 h-screen bg-panel border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border-soft">
        <span className="text-sm font-semibold text-text">Razonete Web</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
      </nav>
      <div className="p-2 border-t border-border-soft">
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
