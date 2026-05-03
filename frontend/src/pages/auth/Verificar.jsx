// src/pages/auth/Verificar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import logoVertical from '../../assets/images/logo_nombre_vertical.png'

export default function Verificar() {
  const [digits,   setDigits]   = useState(['', '', '', '', '', ''])
  const [seconds,  setSeconds]  = useState(179)
  const [canResend,setCanResend]= useState(false)
  const [error,    setError]    = useState('')
  const refs    = useRef([])
  const navigate= useNavigate()

  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setDigits(pasted.split('')); refs.current[5]?.focus() }
  }

  const handleVerify = () => {
    if (digits.join('').length < 6) { setError('Ingresa el código completo'); return }
    navigate('/login')
  }

  const handleResend = () => {
    setSeconds(179); setCanResend(false); setDigits(['', '', '', '', '', ''])
    refs.current[0]?.focus()
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo-panel">
          <img src={logoVertical} alt="Artesanías Colombianas" />
        </div>
        <div className="auth-card__form-panel">
          <p className="auth-card__subtitle">
            Digita el código de 6 dígitos que hemos<br />enviado al correo electrónico asociado.
          </p>

          <div className="otp-container" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className={`otp-input ${d ? 'otp-input--filled' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && <p className="auth-error-global" style={{ textAlign: 'center' }}>{error}</p>}

          <button className="auth-submit-btn" onClick={handleVerify}>Verificar</button>

          <p className="otp-resend">
            Puedes solicitar un código nuevo en: <strong>{fmtTime(seconds)} min</strong>
          </p>
          <button
            className={`otp-resend-btn ${canResend ? 'otp-resend-btn--active' : 'otp-resend-btn--disabled'}`}
            onClick={canResend ? handleResend : undefined}
          >
            Solicitar nuevo código
          </button>

          <div className="auth-link-row">
            Probar otro método <Link to="/recuperar">aquí</Link>
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
