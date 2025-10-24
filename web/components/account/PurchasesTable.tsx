"use client"

type Purchase = {
  id: string
  product_name?: string | null
  product_id?: string | null
  price?: number | null
  currency?: string | null
  status?: string | null
  purchase_date?: string | null
}

export default function PurchasesTable({ purchases }: { purchases: Purchase[] }) {
  if (!purchases || purchases.length === 0) {
    return <div className="text-sm text-gray-500">No purchases yet.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Item</th>
            <th className="py-2 pr-4">Price</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id} className="border-t border-gray-200">
              <td className="py-2 pr-4">{p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : '-'}</td>
              <td className="py-2 pr-4">{p.product_name || p.product_id || '-'}</td>
              <td className="py-2 pr-4">
                {typeof p.price === 'number' ? `$${p.price.toFixed(2)} ${p.currency || 'USD'}` : '-'}
              </td>
              <td className="py-2 pr-4 capitalize">{p.status || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
