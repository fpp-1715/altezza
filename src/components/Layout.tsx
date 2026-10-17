import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">
            Joyeria
          </Link>
          <nav className="space-x-4">
            <Link to="/products" className="hover:underline">
              Productos
            </Link>
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
            <Link to="/cart" className="hover:underline">
              Carrito
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t mt-12 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Joyeria. Todos los derechos reservados.
      </footer>
    </div>
  )
}
