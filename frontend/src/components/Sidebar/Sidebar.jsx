// src/components/Sidebar/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

import cartIcon       from '../../assets/icons/carrito-de-compras.png'
import catalogIcon    from '../../assets/icons/catalogo.png'
import contactIcon    from '../../assets/icons/contacto.png'
import userIcon       from '../../assets/icons/usuario.png'
import inventarioIcon from '../../assets/icons/inventario.png'

import { useAuth } from '../../context/AuthContext'

const CUSTOMER_LINKS = [
  { to: '/',             icon: catalogIcon,    label: 'CATÁLOGO',    alt: 'catalogo'  },
  { to: '/carrito',      icon: cartIcon,       label: 'CARRITO',     alt: 'carrito'   },
  { to: '/mis-pedidos',  icon: inventarioIcon, label: 'MIS PEDIDOS', alt: 'pedidos'   },
  { to: '/contacto',     icon: contactIcon,    label: 'CONTÁCTANOS', alt: 'contacto'  },
]

const ADMIN_LINKS = [
  { to: '/admin/inventario', icon: inventarioIcon, label: 'INVENTARIO',  alt: 'inventario' },
  { to: '/admin/ventas',     icon: cartIcon,       label: 'CREAR VENTA', alt: 'venta'      },
  { to: '/admin/clientes',   icon: userIcon,       label: 'CLIENTES',    alt: 'clientes'   },
  { to: '/admin/envios',     icon: catalogIcon,    label: 'ENVÍOS',      alt: 'envios'     },
  { to: '/admin/reportes',   icon: inventarioIcon, label: 'REPORTES',    alt: 'reportes'   },
  { to: '/mis-ventas',       icon: inventarioIcon, label: 'MIS VENTAS',  alt: 'ventas'     },
  { to: '/admin/usuarios',   icon: userIcon,       label: 'USUARIO',     alt: 'usuario'    },
]

// Sale: inventario (solo lectura), crear venta, clientes (sin eliminar), envíos, reportes
// NO tiene acceso a usuarios
const SALE_LINKS = [
  { to: '/admin/inventario', icon: inventarioIcon, label: 'INVENTARIO',  alt: 'inventario' },
  { to: '/admin/ventas',     icon: cartIcon,       label: 'CREAR VENTA', alt: 'venta'      },
  { to: '/admin/clientes',   icon: userIcon,       label: 'CLIENTES',    alt: 'clientes'   },
  { to: '/admin/envios',     icon: catalogIcon,    label: 'ENVÍOS',      alt: 'envios'     },
  { to: '/admin/reportes',   icon: inventarioIcon, label: 'REPORTES',    alt: 'reportes'   },
  { to: '/mis-ventas',       icon: inventarioIcon, label: 'MIS VENTAS',  alt: 'ventas'     },
]

function getLinks(role) {
  if (role === 'admin') return ADMIN_LINKS
  if (role === 'sale')  return SALE_LINKS
  return CUSTOMER_LINKS
}

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const links     = getLinks(user?.role)

  const handleNav = (to) => { navigate(to); onClose?.() }
  const handleLogout = () => { logout(); navigate('/login'); onClose?.() }

  return (
    <aside className={`sidebar ${open ? '' : 'sidebar--closed'}`}>
      <div className="sidebar__inner">
        <button className="sidebar__back" onClick={onClose}>← Atrás</button>
        <hr className="sidebar__divider" />

        <nav className="sidebar__links">
          {links.map(({ to, icon, label, alt }) => {
            const active = location.pathname === to
            return (
              <div key={to}>
                <button
                  className={`sidebar__link-btn ${active ? 'sidebar__link-btn--active' : ''}`}
                  onClick={() => handleNav(to)}
                >
                  <img src={icon} alt={alt} className="sidebar__link-icon" />
                  {label}
                </button>
                <hr className="sidebar__link-divider" />
              </div>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <hr className="sidebar__footer-divider" />
          {user ? (
            <button className="sidebar__logout-btn" onClick={handleLogout}>
              <img src={userIcon} alt="salir" className="sidebar__link-icon" style={{ opacity: 0.6 }} />
              CERRAR SESIÓN
            </button>
          ) : (
            <button className="sidebar__login-btn" onClick={() => handleNav('/login')}>
              <img src={userIcon} alt="login" className="sidebar__link-icon" />
              INICIAR SESIÓN
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
