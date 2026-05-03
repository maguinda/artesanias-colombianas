// src/pages/auth/Login.jsx
import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import './Auth.css'

import { useAuth } from '../../context/AuthContext'
import logoVertical from '../../assets/images/logo_nombre_vertical.png'
import GoogleButton  from '../../components/GoogleButton/GoogleButton'

export default function Login() {
  const { login, loginWithGoogle }  = useAuth()
  const navigate   = useNavigate()
  const [searchParams] = useSearchParams()
  const registered = searchParams.get('registered') === '1'

  const handleGoogleSuccess = async ({ token, user }) => {
    localStorage.setItem('ac_token', token)
    // Forzar recarga del contexto
    window.location.href = user.role === 'admin' ? '/admin/inventario' : '/'
  }
  const handleGoogleError = (err) => setError('Error con Google: ' + err.message)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(['admin','sale'].includes(user.role) ? '/admin/inventario' : '/')
    } catch (err) {
      setError(err.message)
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
            Inicia sesión para comprar, vender y tener<br />una mejor experiencia
          </p>

          {registered && (
            <div className="auth-card__success">
              ✅ ¡Cuenta creada! Inicia sesión para continuar.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-input-row">
              <span className="auth-input-row__icon">👤</span>
              <div className="auth-input-row__field">
                <input
                  className="auth-input-row__input"
                  type="email"
                  placeholder="Correo o teléfono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-row">
              <span className="auth-input-row__icon">🔒</span>
              <div className="auth-input-row__field">
                <input
                  className="auth-input-row__input"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && <p className="auth-error-global">{error}</p>}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="auth-link-row" style={{ marginBottom: 12 }}>
            <Link to="/recuperar">¿Olvidaste tu contraseña? Recupérala aquí</Link>
          </div>

          <GoogleButton
            buttonId="google-signin-btn-login"
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            label="Inicia sesión con Google"
          />

          <div className="auth-link-row">
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
