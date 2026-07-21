import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-[color:var(--bg)] font-semibold hover:opacity-90',
  ghost: 'bg-transparent border border-border text-text hover:bg-panel-raised',
  danger: 'bg-transparent border border-danger text-danger hover:bg-danger-soft',
  subtle: 'bg-transparent text-text-dim hover:text-text',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-3.5 py-2',
}

export function Button({ variant = 'ghost', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
}
