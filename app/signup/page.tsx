'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/request-access`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao solicitar acesso.')
        return
      }
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleRequest}
        className="bg-panel border border-border rounded-lg shadow-2xl p-6 w-full max-w-sm flex flex-col gap-3"
      >
        <h1 className="text-sm font-medium text-text mb-2">Solicitar acesso — Razonete Web</h1>
        <Input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <span className="text-xs text-danger">{error}</span>}
        {done && (
          <span className="text-xs text-success">
            Solicitação enviada. O administrador entrará em contato com suas credenciais.
          </span>
        )}
        <Button type="submit" variant="primary" className="mt-2" disabled={loading || done}>
          {loading ? 'Enviando…' : 'Solicitar acesso'}
        </Button>
        <Button type="button" variant="subtle" size="sm" onClick={() => router.push('/login')}>
          Já tenho conta
        </Button>
      </form>
    </div>
  )
}
