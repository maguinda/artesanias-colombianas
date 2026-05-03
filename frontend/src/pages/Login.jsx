// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoVertical from '../assets/images/logo_nombre_vertical.png'
import { COLORS } from '../config/theme'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const registered = searchParams.get('registered') === '1'
  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('Completa todos los campos')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin/inventario' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px rgba(45,30,14,.13)', overflow: 'hidden', maxWidth: 780, width: '95%' }}>
        {/* Logo lateral */}
        <div style={{ flex: '0 0 240px', background: COLORS.pastel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, borderRight: `1px solid ${COLORS.cafe_primario}20` }}>
          <img src={logoVertical} alt="Artesanías Colombianas" style={{ width: 160, objectFit: 'contain' }} />
        </div>

        {/* Formulario */}
        <div style={{ flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: COLORS.cafe_primario, marginBottom: 24, textAlign: 'center', lineHeight: 1.5, fontSize: 14 }}>
            Inicia sesión para comprar, vender y tener<br />una mejor experiencia
          </p>

          {registered && (
            <div style={{ background: '#e8f8ef', border: '1.5px solid #27ae60', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1a7a3c', fontWeight: 600, textAlign: 'center' }}>
              ✅ ¡Cuenta creada! Inicia sesión para continuar.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>👤</span>
                <input className="form-input" style={{ flex: 1 }} type="email"
                  placeholder="Correo o teléfono" value={form.email} onChange={set('email')} />
              </div>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <input className="form-input" style={{ flex: 1 }} type="password"
                  placeholder="Contraseña" value={form.password} onChange={set('password')} />
              </div>
            </div>
            {error && <p style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}
              style={{ marginBottom: 10, borderRadius: 8, padding: 13, background: COLORS.accent }}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <Link to="/recuperar" style={{ color: COLORS.accent, fontSize: 13 }}>
              ¿Olvidaste tu contraseña? Recupérala aquí
            </Link>
          </div>

          <button style={{ marginTop: 16, width: '100%', padding: 12, border: `1.5px solid ${COLORS.cafe_primario}20`, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: COLORS.cafe_primario }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#4285F4' }}>G</span> Inicia sesión con Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.gris }}>
            ¿Aún no tienes cuenta? <Link to="/registro" style={{ color: COLORS.accent, fontWeight: 700 }}>Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
