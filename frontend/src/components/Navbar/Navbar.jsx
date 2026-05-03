// src/components/Navbar/Navbar.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

import logoImg    from '../../assets/images/LOGO.png'
import nombreImg  from '../../assets/images/nombre.png'
import cartIcon   from '../../assets/icons/carrito-de-compras.png'
import bellIcon   from '../../assets/icons/notificacion.png'
import userIcon   from '../../assets/icons/usuario.png'
import menuIcon   from '../../assets/icons/menu.png'
import searchIcon from '../../assets/icons/lupa.png'

import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

function Navbar({ onToggleSidebar }) {
  const { user }   = useAuth()
  const { items }  = useCart()
  const navigate   = useNavigate()
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="navbar">
      {/* Marca + menú */}
      <button className="navbar__menu-btn" onClick={onToggleSidebar}>
        <img src={menuIcon} alt="menú" width={22} />
      </button>
      <button className="navbar__brand" onClick={() => navigate('/')}>
        <img src={logoImg}   className="navbar__logo"   alt="logo" />
        <img src={nombreImg} className="navbar__nombre" alt="Artesanías Colombianas" />
      </button>

      {/* Buscador */}
      <form className="navbar__search" onSubmit={handleSearch}>
        <img src={searchIcon} className="navbar__search-icon" alt="buscar" />
        <input
          className="navbar__search-input"
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {/* Acciones */}
      <div className="navbar__actions">
        {user && (
          <button className="navbar__icon-btn" onClick={() => navigate('/carrito')} title="Carrito">
            <img src={cartIcon} alt="carrito" />
            {items.length > 0 && (
              <span className="navbar__cart-badge">{items.length}</span>
            )}
          </button>
        )}

        <button className="navbar__icon-btn" title="Notificaciones">
          <img src={bellIcon} alt="notificaciones" />
        </button>

        {user ? (
          <button className="navbar__avatar" onClick={() => navigate('/perfil')} title="Mi perfil"
            style={{ background: user.avatar ? 'transparent' : 'var(--gold)', padding: user.avatar ? 0 : undefined, overflow: 'hidden' }}>
            {user.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : user.name?.[0]?.toUpperCase() || 'U'
            }
          </button>
        ) : (
          <button className="navbar__login-btn" onClick={() => navigate('/login')} title="Iniciar sesión">
            <img src={userIcon} alt="usuario" />
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar
