export function ResultsBar({ a, b }: { a: number; b: number }) {
  const total = a + b
  if (total <= 0) return null
  const aPct = Math.round((a / total) * 100)
  const bPct = 100 - aPct
  return (
    <div className="relative h-10 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-blue-500/50 text-blue-800 text-sm font-bold flex items-center pl-3"
        style={{ width: `${aPct}%` }}
      >
        {aPct}%
      </div>
      <div
        className="absolute inset-y-0 right-0 bg-red-500/50 text-red-800 text-sm font-bold flex items-center justify-end pr-3"
        style={{ width: `${bPct}%` }}
      >
        {bPct}%
      </div>
    </div>
  )
}
