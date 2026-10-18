import { Outlet } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function AdminPanel() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
