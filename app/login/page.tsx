'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleLogin}
        className="bg-panel border border-border rounded-lg shadow-2xl p-6 w-full max-w-sm flex flex-col gap-3"
      >
        <h1 className="text-sm font-medium text-text mb-2">Entrar — Razonete Web</h1>
        <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        <Button type="submit" variant="primary" className="mt-2">
          Entrar
        </Button>
      </form>
    </div>
  )
}
