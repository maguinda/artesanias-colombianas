// src/hooks/useGoogleAuth.js
// Hook que inicializa Google Identity Services y maneja el callback
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

/**
 * Llama al backend para verificar el credential de Google
 * y guarda el JWT propio en localStorage.
 */
async function loginWithGoogleCredential(credential) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al autenticar con Google')
  return data  // { token, user }
}

/**
 * useGoogleAuth(onSuccess, onError)
 * Inicializa el botón de Google con el renderButtonId dado.
 * onSuccess recibe { token, user }.
 */
export function useGoogleAuth({ onSuccess, onError, renderButtonId }) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return  // Sin Client ID no hay botón real
    if (!window.google?.accounts?.id) return  // SDK no cargado aún

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          const data = await loginWithGoogleCredential(credential)
          onSuccess?.(data)
        } catch (err) {
          onError?.(err)
        }
      },
    })

    if (renderButtonId) {
      const el = document.getElementById(renderButtonId)
      if (el) {
        window.google.accounts.id.renderButton(el, {
          type:  'standard',
          theme: 'outline',
          size:  'large',
          text:  'signin_with',
          shape: 'rectangular',
          width: el.offsetWidth || 340,
          logo_alignment: 'left',
        })
      }
    }
  }, [renderButtonId])
}

export { loginWithGoogleCredential }
