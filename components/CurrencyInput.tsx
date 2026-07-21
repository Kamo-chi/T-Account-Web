'use client'

interface CurrencyInputProps {
  value: number | ''
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CurrencyInput({ value, onChange, placeholder, className = '' }: CurrencyInputProps) {
  const cents = Math.round((typeof value === 'number' ? value : 0) * 100)
  const display = cents === 0 && value === '' ? '' : formatBRL(cents)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    const newCents = digits ? parseInt(digits, 10) : 0
    onChange(newCents / 100)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder || 'R$ 0,00'}
      value={display}
      onChange={handleChange}
      className={`bg-panel-raised border border-border rounded text-sm text-text px-3 py-2 focus:border-accent outline-none font-mono text-right ${className}`}
    />
  )
}
