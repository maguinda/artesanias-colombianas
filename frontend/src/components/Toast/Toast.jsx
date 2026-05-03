// src/components/Toast/Toast.jsx
import { useState, useEffect } from 'react'
import './Toast.css'

// Referencia global al setter
let _setToast = null

export function useToast() {
  return (msg, type = 'success') => _setToast?.({ msg, type })
}

function Toast() {
  const [toast, setToast] = useState(null)
  _setToast = setToast

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null

  return (
    <div className={`toast toast--${toast.type}`}>
      {toast.msg}
    </div>
  )
}

export default Toast
