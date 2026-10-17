export default function Home() {
  return (
    <section>
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Joyeria</h1>
      <p className="mb-6">Tienda de ejemplo para joyas — catálogo, detalles y carrito.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded p-4">Producto ejemplo 1</div>
        <div className="border rounded p-4">Producto ejemplo 2</div>
        <div className="border rounded p-4">Producto ejemplo 3</div>
      </div>
    </section>
  )
}
