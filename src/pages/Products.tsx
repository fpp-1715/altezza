import { Link } from 'react-router-dom'

const sample = [
  { id: '1', name: 'Anillo Oro', price: '$120' },
  { id: '2', name: 'Collar Plata', price: '$80' },
  { id: '3', name: 'Pulsera', price: '$60' },
]

export default function Products() {
  return (
    <section>
      <h1 className="text-3xl font-semibold mb-4">Productos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sample.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="border rounded p-4 hover:shadow">
            <h2 className="font-medium">{p.name}</h2>
            <p className="text-sm text-gray-600">{p.price}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
