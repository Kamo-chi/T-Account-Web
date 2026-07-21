import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
}

export function Input({ mono = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`bg-panel-raised border border-border rounded text-sm text-text px-3 py-2 focus:border-accent outline-none ${
        mono ? 'font-mono' : ''
      } ${className}`}
      {...props}
    />
  )
}
