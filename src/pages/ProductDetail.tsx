import { useParams } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()
  return (
    <section>
      <h1 className="text-3xl font-semibold mb-4">Detalle del producto</h1>
      <p>ID: {id}</p>
      <div className="mt-4 border p-4 rounded">
        <h2 className="text-2xl">Nombre del producto {id}</h2>
        <p className="mt-2">Descripción breve del producto.</p>
      </div>
    </section>
  )
}
