'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleSignup}
        className="bg-panel border border-border rounded-lg shadow-2xl p-6 w-full max-w-sm flex flex-col gap-3"
      >
        <h1 className="text-sm font-medium text-text mb-2">Criar conta — Razonete Web</h1>
        <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <span className="text-xs text-danger">{error}</span>}
        {done && (
          <span className="text-xs text-success">Conta criada. Verifique seu e-mail para confirmar.</span>
        )}
        <Button type="submit" variant="primary" className="mt-2">
          Cadastrar
        </Button>
        <Button type="button" variant="subtle" size="sm" onClick={() => router.push('/login')}>
          Já tenho conta
        </Button>
      </form>
    </div>
  )
}
