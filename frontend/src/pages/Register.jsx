// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoVertical from '../assets/images/logo_nombre_vertical.png'
import { COLORS } from '../config/theme'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', apellidos: '', email: '',
    phone: '', password: '', confirm_password: '', terms: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // set devuelve siempre la MISMA función por campo para no generar re-renders innecesarios
  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.full_name.trim())      e.full_name        = 'El nombre es requerido'
    if (!form.apellidos.trim())      e.apellidos        = 'Los apellidos son requeridos'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Correo inválido'
    if (!form.phone.trim())          e.phone            = 'El teléfono es requerido'
    if (form.password.length < 6)    e.password         = 'Mínimo 6 caracteres'
    if (form.password !== form.confirm_password) e.confirm_password = 'Las contraseñas no coinciden'
    if (!form.terms)                 e.terms            = 'Debes aceptar los términos'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    setErrors({})
    setLoading(true)
    try {
      await register({
        full_name: `${form.full_name} ${form.apellidos}`,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        phone: form.phone
      })
      navigate('/login?registered=1')
    } catch (err) {
      setErrors({ global: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Estilos reutilizables
  const rowStyle = { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }
  const iconStyle = { fontSize: 20, marginTop: 10, flexShrink: 0, width: 26 }

  return (
    <div style={{ minHeight: '100vh', background: '#f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px rgba(45,30,14,.13)', overflow: 'hidden', maxWidth: 780, width: '95%' }}>

        {/* ── Logo lateral ── */}
        <div style={{ flex: '0 0 200px', background: COLORS.pastel, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, borderRight: `1px solid ${COLORS.cafe_primario}20` }}>
          <img src={logoVertical} alt="Artesanías Colombianas" style={{ width: 140, objectFit: 'contain' }} />
        </div>

        {/* ── Formulario ── */}
        <div style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
          <p style={{ color: COLORS.cafe_primario, marginBottom: 20, fontSize: 13, lineHeight: 1.5 }}>
            Regístrate con tus datos personales, recuerda que todos
            los datos marcados con (*) son obligatorios
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Nombre */}
            <div style={rowStyle}>
              <span style={iconStyle}>👤</span>
              <div style={{ flex: 1 }}>
                <input className="form-input" style={{ width: '100%' }}
                  type="text" placeholder="Nombre *"
                  value={form.full_name} onChange={set('full_name')} />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
            </div>

            {/* Apellidos */}
            <div style={rowStyle}>
              <span style={iconStyle}>👤</span>
              <div style={{ flex: 1 }}>
                <input className="form-input" style={{ width: '100%' }}
                  type="text" placeholder="Apellidos *"
                  value={form.apellidos} onChange={set('apellidos')} />
                {errors.apellidos && <div className="form-error">{errors.apellidos}</div>}
              </div>
            </div>

            {/* Correo */}
            <div style={rowStyle}>
              <span style={iconStyle}>✉️</span>
              <div style={{ flex: 1 }}>
                <input className="form-input" style={{ width: '100%' }}
                  type="email" placeholder="Correo *"
                  value={form.email} onChange={set('email')} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
            </div>

            {/* Teléfono */}
            <div style={rowStyle}>
              <span style={iconStyle}>📱</span>
              <div style={{ flex: 1 }}>
                <input className="form-input" style={{ width: '100%' }}
                  type="tel" placeholder="Teléfono *"
                  value={form.phone} onChange={set('phone')} />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>

            {/* Contraseña */}
            <div style={rowStyle}>
              <span style={iconStyle}>🔒</span>
              <div style={{ flex: 1 }}>
                <input className="form-input" style={{ width: '100%' }}
                  type="password" placeholder="Contraseña *"
                  value={form.password} onChange={set('password')}
                  autoComplete="new-password" />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
            </div>

            {/* Repetir contraseña */}
            <div style={rowStyle}>
              <span style={iconStyle}>🔒</span>
              <div style={{ flex: 1 }}>
                <input className="form-input" style={{ width: '100%' }}
                  type="password" placeholder="Repetir Contraseña *"
                  value={form.confirm_password} onChange={set('confirm_password')}
                  autoComplete="new-password" />
                {errors.confirm_password && <div className="form-error">{errors.confirm_password}</div>}
              </div>
            </div>

            {/* Términos */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
              <input type="checkbox" id="terms" checked={form.terms} onChange={set('terms')} style={{ marginTop: 3 }} />
              <label htmlFor="terms" style={{ fontSize: 13, color: COLORS.cafe_primario, cursor: 'pointer' }}>
                Al registrarme acepto los{' '}
                <a href="#" style={{ color: COLORS.accent }}>Términos y Condiciones</a>
              </label>
            </div>
            {errors.terms  && <div className="form-error" style={{ marginBottom: 10 }}>{errors.terms}</div>}
            {errors.global && <div className="form-error" style={{ marginBottom: 10 }}>{errors.global}</div>}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}
              style={{ marginBottom: 10, background: COLORS.accent }}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>

            <button type="button" style={{ width: '100%', padding: 12, border: `1.5px solid ${COLORS.cafe_primario}20`, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: COLORS.cafe_primario }}>
              <span style={{ fontWeight: 700, color: '#4285F4' }}>G</span> Regístrate con Google
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: COLORS.gris }}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" style={{ color: COLORS.accent, fontWeight: 700 }}>Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
