// src/components/index.jsx — componentes compartidos con assets reales
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// ── Assets reales del proyecto ──
import logoImg   from '../assets/images/LOGO.png'
import nombreImg from '../assets/images/nombre.png'
import cartIcon  from '../assets/icons/carrito-de-compras.png'
import bellIcon  from '../assets/icons/notificacion.png'
import userIcon  from '../assets/icons/usuario.png'
import menuIcon  from '../assets/icons/menu.png'
import searchIcon from '../assets/icons/lupa.png'
import filterIcon from '../assets/icons/filtrar.png'
import catalogIcon from '../assets/icons/catalogo.png'
import contactIcon from '../assets/icons/contacto.png'
import inventarioIcon from '../assets/icons/inventario.png'
import instagramIcon from '../assets/icons/instagram.png'
import facebookIcon  from '../assets/icons/facebook.png'
import twitterIcon   from '../assets/icons/x.png'
import tiktokIcon    from '../assets/icons/tiktok.png'
import whatsappIcon  from '../assets/icons/whatsapp.png'
import youtubeIcon   from '../assets/icons/youtube.png'
import { COLORS } from '../config/theme'
import { CONTACT_INFO, STORES, APP_NAME } from '../config/constants'

/* ── Stars ── */
export function Stars({ rating = 5, max = 5 }) {
  return (
    <div className="rating">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < rating ? 'star' : 'star-empty'}>★</span>
      ))}
    </div>
  )
}

/* ── Qty Control ── */
export function QtyCtrl({ value, onChange, min = 1 }) {
  return (
    <div className="qty-ctrl">
      <button className="qty-btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="qty-val">{value}</span>
      <button className="qty-btn" onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}

/* ── Toast ── */
let _setToast = null
export function useToast() {
  return (msg, type = 'success') => _setToast?.({ msg, type })
}
export function ToastProvider() {
  const [toast, setToast] = useState(null)
  _setToast = setToast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast) return null
  return <div className={`toast ${toast.type}`}>{toast.msg}</div>
}

/* ── Product Card ── */
export function ProductCard({ product, onClick }) {
  const fmt = (n) => `$${Number(n).toLocaleString('es-CO')}`
  const img = product.image || product.thumbnail || product.img || 'https://placehold.co/300x300/f5e6d3/2D1E0E?text=Artesanía'
  return (
    <div className="product-card" onClick={onClick}>
      <img src={img} alt={product.name}
        onError={e => { e.target.src = 'https://placehold.co/300x300/f5e6d3/2D1E0E?text=Artesanía' }} />
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <Stars rating={5} />
        <div className="product-card-stock">Stock: {product.stock ?? 10}</div>
        <div className="product-card-price">{fmt(product.price)}</div>
      </div>
    </div>
  )
}

/* ── Navbar ── */
export function Navbar({ onToggleSidebar }) {
  const { user } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--header-h)',
      background: COLORS.pastel, borderBottom: `1px solid ${COLORS.cream_dark || '#ede8e0'}`,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
      zIndex: 100, boxShadow: '0 1px 6px rgba(45,30,14,.08)'
    }}>
      {/* Logo */}
      <button onClick={onToggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <img src={menuIcon} alt="menu" width={22} style={{ opacity: .7 }} />
        <img src={logoImg}  alt="logo" width={48} />
        <img src={nombreImg} alt="Artesanías Colombianas" width={110} />
      </button>

      {/* Búsqueda */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
        <div style={{ position: 'relative' }}>
          <img src={searchIcon} alt="buscar" width={18}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: .5 }} />
          <input
            className="form-input"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 40, borderRadius: 24, border: `1px solid ${COLORS.cafe_primario}` }}
          />
        </div>
      </form>

      {/* Iconos derechos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
        {user && (
          <button onClick={() => navigate('/carrito')} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <img src={cartIcon} alt="carrito" width={26} />
            {items.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: COLORS.accent, color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {items.length}
              </span>
            )}
          </button>
        )}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={bellIcon} alt="notificaciones" width={26} />
        </button>
        {user
          ? <button onClick={() => navigate('/perfil')} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </button>
          : <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <img src={userIcon} alt="usuario" width={30} />
            </button>
        }
      </div>
    </header>
  )
}

/* ── Sidebar ── */
const CUSTOMER_LINKS = [
  { to: '/',            icon: catalogIcon,    label: 'CATÁLOGO',     alt: 'catalogo' },
  { to: '/carrito',     icon: cartIcon,       label: 'CARRITO',      alt: 'carrito' },
  { to: '/contacto',    icon: contactIcon,    label: 'CONTÁCTANOS',  alt: 'contacto' },
]
const ADMIN_LINKS = [
  { to: '/admin/inventario', icon: inventarioIcon, label: 'INVENTARIO',   alt: 'inventario' },
  { to: '/admin/ventas',     icon: cartIcon,        label: 'CREAR VENTA',  alt: 'venta' },
  { to: '/admin/clientes',   icon: userIcon,        label: 'CLIENTES',     alt: 'clientes' },
  { to: '/admin/envios',     icon: catalogIcon,     label: 'ENVÍOS',       alt: 'envios' },
  { to: '/admin/reportes',   icon: inventarioIcon,  label: 'REPORTES',     alt: 'reportes' },
  { to: '/admin/usuarios',   icon: userIcon,        label: 'USUARIO',      alt: 'usuario' },
]

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const links = user?.role === 'admin' ? ADMIN_LINKS : CUSTOMER_LINKS

  const handleNav = (to) => { navigate(to); onClose?.() }
  const handleLogout = () => { logout(); navigate('/login'); onClose?.() }

  return (
    <aside style={{
      position: 'fixed', top: 'var(--header-h)', left: 0, bottom: 0,
      width: open ? 'var(--sidebar-w)' : 0,
      transition: 'width .3s', overflow: 'hidden',
      background: COLORS.pastel,
      borderRight: `1px solid ${COLORS.cafe_primario}20`,
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      <div style={{ width: 'var(--sidebar-w)', display: 'flex', flexDirection: 'column', height: '100%', padding: '12px 0' }}>
        {/* Back */}
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6, color: COLORS.cafe_primario, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          ← Atrás
        </button>
        <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.cafe_primario}`, margin: '0 20px 8px' }} />

        {/* Links */}
        <div style={{ flex: 1 }}>
          {links.map(({ to, icon, label, alt }) => {
            const active = location.pathname === to
            return (
              <div key={to}>
                <button onClick={() => handleNav(to)} style={{
                  width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: active ? COLORS.accent : COLORS.cafe_primario,
                  fontWeight: 700, fontSize: 13, letterSpacing: '.4px', textAlign: 'left',
                }}>
                  <img src={icon} alt={alt} width={20} />
                  {label}
                </button>
                <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.cafe_primario}30`, margin: '0 20px' }} />
              </div>
            )
          })}
        </div>

        {/* Footer del sidebar */}
        <div>
          <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.cafe_primario}`, margin: '0 20px 8px' }} />
          {user
            ? <button onClick={handleLogout} style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#e74c3c', fontWeight: 700, fontSize: 13 }}>
                <img src={userIcon} alt="logout" width={20} style={{ opacity: .6 }} />
                CERRAR SESIÓN
              </button>
            : <button onClick={() => handleNav('/login')} style={{ width: '100%', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: COLORS.cafe_primario, fontWeight: 700, fontSize: 13 }}>
                <img src={userIcon} alt="login" width={20} />
                INICIAR SESIÓN
              </button>
          }
        </div>
      </div>
    </aside>
  )
}

/* ── Filter Bar ── */
const FILTER_CATS = ['Todos', 'Porcelana', 'Ruanas', 'Cuadros', 'Accesorios', 'Bebé', 'Baño']
export function FilterBar({ active = 'Todos', onFilter }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '6px 20px', background: COLORS.gris_claro,
      boxShadow: '0 1px 3px rgba(0,0,0,.1)', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img src={filterIcon} alt="filtro" width={18} />
        <span style={{ color: COLORS.gris, fontSize: 13 }}>Filtrar por...</span>
      </div>
      <div style={{ width: 1, height: 20, background: COLORS.gris }} />
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {FILTER_CATS.map(cat => (
          <button key={cat} className={`filter-btn ${active === cat ? 'active' : ''}`}
            onClick={() => onFilter?.(cat)}>{cat}</button>
        ))}
      </div>
    </div>
  )
}

/* ── Footer ── */
export function Footer() {
  return (
    <footer style={{
      background: COLORS.pastel, padding: '28px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'stretch',
      flexWrap: 'wrap', borderTop: `2px solid ${COLORS.cafe_primario}`, minHeight: 200,
    }}>
      {/* Logo */}
      <div style={{ flex: 1, minWidth: 180, paddingRight: 20, borderRight: `1px solid ${COLORS.cafe_primario}` }}>
        <img src={logoImg}   alt="logo"   width={80} />
        <img src={nombreImg} alt="nombre" width={100} style={{ display: 'block', marginTop: 8 }} />
        <p style={{ color: COLORS.cafe_primario, fontSize: 12, marginTop: 8 }}>Descarga la aplicación</p>
      </div>

      {/* Tiendas */}
      <div style={{ flex: 1, minWidth: 180, padding: '0 20px', borderRight: `1px solid ${COLORS.cafe_primario}`, textAlign: 'left' }}>
        <h4 style={{ color: COLORS.cafe_primario, marginBottom: 10 }}>Vista nuestros puntos físicos</h4>
        <p style={{ color: COLORS.cafe_primario, fontWeight: 700, fontSize: 13 }}>Bogotá</p>
        <p style={{ color: COLORS.cafe_primario, fontSize: 13 }}>{STORES.tienda_1}</p>
        <p style={{ color: COLORS.cafe_primario, fontSize: 13 }}>{STORES.tienda_2}</p>
        <p style={{ color: COLORS.cafe_primario, fontWeight: 700, fontSize: 13, marginTop: 8 }}>Medellín</p>
        <p style={{ color: COLORS.cafe_primario, fontSize: 13 }}>{STORES.tienda_3}</p>
      </div>

      {/* Contacto */}
      <div style={{ flex: 1, minWidth: 180, padding: '0 20px', borderRight: `1px solid ${COLORS.cafe_primario}`, textAlign: 'left' }}>
        <h4 style={{ color: COLORS.cafe_primario, marginBottom: 10 }}>Contáctanos</h4>
        {CONTACT_INFO.emails.map((e, i) => <p key={i} style={{ color: COLORS.cafe_primario, fontSize: 13 }}>{e}</p>)}
        {CONTACT_INFO.phones.map((p, i) => <p key={i} style={{ color: COLORS.cafe_primario, fontSize: 13 }}>{p}</p>)}
      </div>

      {/* Redes */}
      <div style={{ flex: 1, minWidth: 180, paddingLeft: 20, textAlign: 'center' }}>
        <h4 style={{ color: COLORS.cafe_primario, marginBottom: 12 }}>Síguenos en redes sociales</h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
          {[instagramIcon, facebookIcon, twitterIcon].map((icon, i) => (
            <img key={i} src={icon} alt="" width={34} className="social-icon" style={{ cursor: 'pointer' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          {[tiktokIcon, whatsappIcon, youtubeIcon].map((icon, i) => (
            <img key={i} src={icon} alt="" width={34} className="social-icon" style={{ cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ── Layout principal ── */
export function Layout({ children, showFilter = false, filterActive, onFilter }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ display: 'flex', flex: 1, marginTop: 'var(--header-h)' }}>
        {/* Espacio del sidebar */}
        <div style={{ width: sidebarOpen ? 'var(--sidebar-w)' : 0, transition: 'width .3s', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {showFilter && <FilterBar active={filterActive} onFilter={onFilter} />}
          <main style={{ flex: 1, padding: '0', background: '#fff' }}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
      <ToastProvider />
    </div>
  )
}

/* ── Page spinner ── */
export function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  )
}

/* ── Protected route ── */
export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (!loading && !user) navigate('/login')
    if (!loading && adminOnly && user?.role !== 'admin') navigate('/')
  }, [user, loading])
  if (loading) return <PageSpinner />
  return children
}

/* ── Format currency ── */
export function fmt(n) {
  return `$${Number(n).toLocaleString('es-CO')}`
}
