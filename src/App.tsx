import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Cart from './pages/Cart'
import Catalog from './pages/Catalog'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import AdminPanel from './pages/AdminPanel'
import AdminDashboard from './pages/AdminDashboard'
import AdminProductos from './pages/adminProductos'
import AdminProductoForm from './pages/adminProductoForm'
import AdminOfertas from './pages/AdminOfertas'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminCategorias from './pages/AdminCategorias'
import AdminUsuarios from './pages/AdminUsuarios'

function AdminRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-[#131313] p-8 text-center text-on-surface-variant">Verificando sesión…</div>
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <CartProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/bolsa" element={<Cart />} />
              <Route path="*" element={<Home />} />
            </Route>

            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/productos" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="productos/nuevo" element={<AdminProductoForm />} />
              <Route path="productos/:id" element={<AdminProductoForm />} />
              <Route path="categorias" element={<AdminCategorias />} />
              <Route path="ofertas" element={<AdminOfertas />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </CartProvider>
  )
}
