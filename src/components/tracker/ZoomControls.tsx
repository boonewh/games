'use client'

interface Props {
  isMin: boolean
  isMax: boolean
  isDefault: boolean
  onChange: (delta: number) => void
  onReset: () => void
}

export function ZoomControls({ isMin, isMax, isDefault, onChange, onReset }: Props) {
  const btnBase =
    'flex items-center justify-center rounded border border-stone-light text-parchment/60 hover:text-parchment hover:border-wotr-gold/50 disabled:opacity-25 disabled:cursor-not-allowed leading-none'

  return (
    <div className="flex items-center gap-1" title="Adjust text size">
      <button
        onClick={() => onChange(-1)}
        disabled={isMin}
        className={`w-7 h-7 text-sm font-cinzel ${btnBase}`}
        aria-label="Decrease text size"
      >
        A−
      </button>
      <button
        onClick={onReset}
        disabled={isDefault}
        className={`w-7 h-7 text-base ${btnBase}`}
        aria-label="Reset text size to default"
        title="Reset to default size"
      >
        ↺
      </button>
      <button
        onClick={() => onChange(1)}
        disabled={isMax}
        className={`w-7 h-7 text-base font-cinzel ${btnBase}`}
        aria-label="Increase text size"
      >
        A+
      </button>
    </div>
  )
}
