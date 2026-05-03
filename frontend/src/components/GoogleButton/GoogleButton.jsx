// src/components/GoogleButton/GoogleButton.jsx
import './GoogleButton.css'
import { useGoogleAuth } from '../../hooks/useGoogleAuth'

const HAS_CLIENT_ID = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

/**
 * Botón de Google Sign-In.
 * - Si VITE_GOOGLE_CLIENT_ID está configurado: renderiza el botón oficial de Google.
 * - Si no: muestra botón visual con nota de configuración.
 *
 * Props:
 *   buttonId   — id único del div donde se renderiza el botón (default: 'google-signin-btn')
 *   onSuccess  — fn({ token, user }) llamada cuando el login es exitoso
 *   onError    — fn(Error) llamada cuando falla
 *   label      — texto del botón fallback
 */
function GoogleButton({ buttonId = 'google-signin-btn', onSuccess, onError, label = 'Continuar con Google' }) {
  useGoogleAuth({ onSuccess, onError, renderButtonId: HAS_CLIENT_ID ? buttonId : null })

  if (HAS_CLIENT_ID) {
    return (
      <div className="google-btn-wrapper">
        <div id={buttonId} />
      </div>
    )
  }

  // Fallback visual cuando no hay Client ID configurado
  return (
    <div className="google-btn-wrapper">
      <button
        type="button"
        className="google-btn-fallback"
        title="Configura VITE_GOOGLE_CLIENT_ID en frontend/.env para habilitar"
        onClick={() => alert('Configura VITE_GOOGLE_CLIENT_ID en frontend/.env.local para habilitar Google Sign-In')}
      >
        <span className="google-btn-fallback__g">G</span>
        <span>
          {label}
          <span className="google-btn-fallback__note">(requiere configuración)</span>
        </span>
      </button>
    </div>
  )
}

export default GoogleButton
