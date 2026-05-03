// src/pages/auth/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

import { useAuth } from '../../context/AuthContext'
import logoVertical from '../../assets/images/logo_nombre_vertical.png'
import GoogleButton  from '../../components/GoogleButton/GoogleButton'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const handleGoogleSuccess = ({ token, user }) => {
    localStorage.setItem('ac_token', token)
    window.location.href = user.role === 'admin' ? '/admin/inventario' : '/'
  }
  const handleGoogleError = (err) => setErrors({ global: 'Error con Google: ' + err.message })

  // Estado plano — un useState por grupo de campos relacionados
  const [fullName,         setFullName]         = useState('')
  const [apellidos,        setApellidos]        = useState('')
  const [email,            setEmail]            = useState('')
  const [phone,            setPhone]            = useState('')
  const [password,         setPassword]         = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [terms,            setTerms]            = useState(false)

  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!fullName.trim())         e.fullName        = 'El nombre es requerido'
    if (!apellidos.trim())        e.apellidos       = 'Los apellidos son requeridos'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo inválido'
    if (!phone.trim())            e.phone           = 'El teléfono es requerido'
    if (password.length < 6)     e.password        = 'Mínimo 6 caracteres'
    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    if (!terms)                   e.terms           = 'Debes aceptar los términos'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register({
        full_name:        `${fullName} ${apellidos}`,
        email,
        password,
        confirm_password: confirmPassword,
        phone,
      })
      navigate('/login?registered=1')
    } catch (err) {
      setErrors({ global: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Panel logo */}
        <div className="auth-card__logo-panel">
          <img src={logoVertical} alt="Artesanías Colombianas" />
        </div>

        {/* Panel formulario */}
        <div className="auth-card__form-panel">
          <p className="auth-card__subtitle">
            Regístrate con tus datos personales, recuerda que todos
            los datos marcados con (*) son obligatorios
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Nombre */}
            <div className="auth-input-row">
              <span className="auth-input-row__icon">👤</span>
              <div className="auth-input-row__field">
                <input className="auth-input-row__input" type="text" placeholder="Nombre *"
                  value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="given-name" />
                {errors.fullName && <p className="auth-input-row__error">{errors.fullName}</p>}
              </div>
            </div>

            {/* Apellidos */}
            <div className="auth-input-row">
              <span className="auth-input-row__icon">👤</span>
              <div className="auth-input-row__field">
                <input className="auth-input-row__input" type="text" placeholder="Apellidos *"
                  value={apellidos} onChange={(e) => setApellidos(e.target.value)} autoComplete="family-name" />
                {errors.apellidos && <p className="auth-input-row__error">{errors.apellidos}</p>}
              </div>
            </div>

            {/* Correo */}
            <div className="auth-input-row">
              <span className="auth-input-row__icon">✉️</span>
              <div className="auth-input-row__field">
                <input className="auth-input-row__input" type="email" placeholder="Correo *"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                {errors.email && <p className="auth-input-row__error">{errors.email}</p>}
              </div>
            </div>

            {/* Teléfono */}
            <div className="auth-input-row">
              <span className="auth-input-row__icon">📱</span>
              <div className="auth-input-row__field">
                <input className="auth-input-row__input" type="tel" placeholder="Teléfono *"
                  value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                {errors.phone && <p className="auth-input-row__error">{errors.phone}</p>}
              </div>
            </div>

            {/* Contraseña */}
            <div className="auth-input-row">
              <span className="auth-input-row__icon">🔒</span>
              <div className="auth-input-row__field">
                <input className="auth-input-row__input" type="password" placeholder="Contraseña *"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                {errors.password && <p className="auth-input-row__error">{errors.password}</p>}
              </div>
            </div>

            {/* Repetir contraseña */}
            <div className="auth-input-row">
              <span className="auth-input-row__icon">🔒</span>
              <div className="auth-input-row__field">
                <input className="auth-input-row__input" type="password" placeholder="Repetir Contraseña *"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                {errors.confirmPassword && <p className="auth-input-row__error">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Términos */}
            <div className="auth-terms">
              <input type="checkbox" id="terms" className="auth-terms__checkbox"
                checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <label htmlFor="terms" className="auth-terms__label">
                Al registrarme acepto los <a href="#" className="auth-terms__link">Términos y Condiciones</a>
              </label>
            </div>
            {errors.terms  && <p className="auth-input-row__error">{errors.terms}</p>}
            {errors.global && <p className="auth-error-global">{errors.global}</p>}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </button>

            <GoogleButton
              buttonId="google-signin-btn-register"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              label="Regístrate con Google"
            />
          </form>

          <div className="auth-link-row">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
