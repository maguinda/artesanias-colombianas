// src/pages/auth/Recuperar.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import logoVertical from '../../assets/images/logo_nombre_vertical.png'

export default function Recuperar() {
  const [email,  setEmail]  = useState('')
  const [sent,   setSent]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo-panel">
          <img src={logoVertical} alt="Artesanías Colombianas" />
        </div>
        <div className="auth-card__form-panel">
          {sent ? (
            <>
              <p className="auth-card__subtitle">
                ¡Código enviado a <strong>{email}</strong>!<br />
                Revisa tu correo electrónico.
              </p>
              <button className="auth-submit-btn" onClick={() => navigate('/verificar')}>
                Verificar código
              </button>
            </>
          ) : (
            <>
              <p className="auth-card__subtitle">
                Escribe el correo asociado a tu cuenta,<br />
                te enviaremos un código de verificación.
              </p>
              <form onSubmit={handleSubmit} noValidate>
                <div className="auth-input-row">
                  <span className="auth-input-row__icon">✉️</span>
                  <div className="auth-input-row__field">
                    <input className="auth-input-row__input" type="email" placeholder="Correo"
                      value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                </div>
                <button className="auth-submit-btn" type="submit">Enviar código</button>
              </form>
            </>
          )}
          <div className="auth-link-row">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
      <button className="auth-google-btn" style={{ maxWidth: 360 }}>
        <span className="auth-google-btn__g">G</span> Inicia sesión con Google
      </button>
      <div className="auth-link-row">
        ¿Aún no tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
      </div>
    </div>
  )
}
