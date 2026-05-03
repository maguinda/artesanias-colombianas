// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import { useAuth }       from './context/AuthContext'
import Spinner           from './components/Spinner/Spinner'
// Auth
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'
import Recuperar from './pages/auth/Recuperar'
import Verificar from './pages/auth/Verificar'

// Customer
import Home          from './pages/customer/Home'
import ProductDetail from './pages/customer/ProductDetail'
import Cart          from './pages/customer/Cart'
import MisPedidos    from './pages/customer/MisPedidos'
import MisVentas     from './pages/admin/MisVentas'
import Perfil        from './pages/customer/Perfil'
import PagarOrden    from './pages/customer/PagarOrden'

// Admin
import Inventario from './pages/admin/Inventario'
import CrearVenta from './pages/admin/CrearVenta'
import Clientes   from './pages/admin/Clientes'
import Usuarios   from './pages/admin/Usuarios'
import Envios     from './pages/admin/Envios'
import Reportes   from './pages/admin/Reportes'

function ProtectedRoute({ children, adminOnly = false, staffOnly = false, customerOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  if (staffOnly && !['admin','sale'].includes(user.role)) return <Navigate to="/" replace />
  if (customerOnly && ['admin','sale'].includes(user.role)) return <Navigate to="/admin/inventario" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"     element={<Login />} />
      <Route path="/registro"  element={<Register />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/verificar" element={<Verificar />} />

      {/* Cliente */}
      <Route path="/"              element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/producto/:id"  element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
      <Route path="/carrito"       element={<ProtectedRoute customerOnly><Cart /></ProtectedRoute>} />
      <Route path="/mis-pedidos"   element={<ProtectedRoute customerOnly><MisPedidos /></ProtectedRoute>} />
      <Route path="/mis-ventas"    element={<ProtectedRoute staffOnly><MisVentas /></ProtectedRoute>} />
      <Route path="/perfil"        element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/pagar/:id"      element={<ProtectedRoute customerOnly><PagarOrden /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/inventario" element={<ProtectedRoute staffOnly><Inventario /></ProtectedRoute>} />
      <Route path="/admin/ventas"     element={<ProtectedRoute staffOnly><CrearVenta /></ProtectedRoute>} />
      <Route path="/admin/clientes"   element={<ProtectedRoute staffOnly><Clientes /></ProtectedRoute>} />
      <Route path="/admin/usuarios"   element={<ProtectedRoute adminOnly><Usuarios /></ProtectedRoute>} />
      <Route path="/admin/envios"     element={<ProtectedRoute staffOnly><Envios /></ProtectedRoute>} />
      <Route path="/admin/reportes"   element={<ProtectedRoute staffOnly><Reportes /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
