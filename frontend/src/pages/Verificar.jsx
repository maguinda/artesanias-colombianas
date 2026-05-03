import logoVertical from '../assets/images/logo_nombre_vertical.png'
// src/pages/Verificar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Verificar() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [seconds, setSeconds] = useState(179)   // 2:59
  const [canResend, setCanResend] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])
  const navigate = useNavigate()

  // Countdown
  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

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
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleVerify = () => {
    const code = digits.join('')
    if (code.length < 6) return setError('Ingresa el código completo de 6 dígitos')
    // Simulación — en producción validar contra backend
    navigate('/login')
  }

  const handleResend = () => {
    setSeconds(179)
    setCanResend(false)
    setDigits(['', '', '', '', '', ''])
    refs.current[0]?.focus()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0ece4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <div style={{ display: 'flex', background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px rgba(61,31,0,.13)', overflow: 'hidden', maxWidth: 760, width: '95%' }}>
        {/* Logo */}
        <div style={{ flex: '0 0 220px', background: '#f8f4ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, borderRight: '1px solid #ede8e0' }}>
          <div style={{ fontSize: 70 }}>🎨</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--brown)', marginTop: 16, textAlign: 'center', lineHeight: 1.2 }}>
            ARTESANÍAS<br />COLOMBIANAS
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--gray-700)', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
            Digita el código de 6 dígitos, que hemos<br />enviado al correo electrónico asociado.
          </p>

          {/* OTP boxes */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                maxLength={1}
                style={{
                  width: 52, height: 56, textAlign: 'center',
                  fontSize: 22, fontWeight: 700, borderRadius: 10,
                  border: `2px solid ${d ? 'var(--gold)' : 'var(--gray-100)'}`,
                  outline: 'none', background: d ? '#fdf8f2' : '#fff',
                  color: 'var(--brown)', transition: 'border .15s',
                  fontFamily: 'var(--font-body)',
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            className="btn btn-primary"
            onClick={handleVerify}
            style={{ padding: '13px 52px', borderRadius: 8, marginBottom: 20, fontSize: 15 }}
          >
            Verificar
          </button>

          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 6 }}>
            Puedes solicitar un código nuevo en:{' '}
            <strong style={{ color: 'var(--brown)' }}>{fmt(seconds)} min</strong>
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend}
            style={{
              background: 'none', border: 'none', color: canResend ? 'var(--gold)' : 'var(--gray-300)',
              fontWeight: 600, fontSize: 13, cursor: canResend ? 'pointer' : 'default',
              marginBottom: 20,
            }}
          >
            Solicitar nuevo código
          </button>

          <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>
            Probar otro método{' '}
            <Link to="/recuperar" style={{ color: 'var(--gold)', fontWeight: 700 }}>aquí</Link>
          </p>
        </div>
      </div>

      {/* Google btn */}
      <button style={{ padding: '12px 28px', border: '1.5px solid var(--gray-100)', borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: 'var(--shadow)' }}>
        <span style={{ fontSize: 18 }}>G</span> Inicia sesión con Google
      </button>

      <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
        ¿Aún no tienes una cuenta?{' '}
        <Link to="/registro" style={{ color: 'var(--gold)', fontWeight: 700 }}>Regístrate aquí</Link>
      </p>
    </div>
  )
}
