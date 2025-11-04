interface StatusBadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'info'
}

export function StatusBadge({ children, variant = 'success' }: StatusBadgeProps) {
  const variantStyles = {
    success: 'text-[var(--color-success)] bg-[var(--color-success)]/10',
    warning: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10',
    info: 'text-[var(--color-primary)] bg-[var(--color-primary)]/10',
  }

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${variantStyles[variant]}`}>
      {children}
    </span>
  )
}
