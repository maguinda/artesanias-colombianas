// src/pages/customer/Perfil.jsx
import { useState, useEffect, useRef } from 'react'
import './Perfil.css'
import MainLayout   from '../../layouts/MainLayout'
import Spinner      from '../../components/Spinner/Spinner'
import { useToast } from '../../components/Toast/Toast'
import { useAuth }  from '../../context/AuthContext'
import { authService, uploadService } from '../../services/api'

export default function Perfil() {
  const { user }  = useAuth()
  const toast     = useToast()
  const fileRef   = useRef(null)

  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)

  const [fullName,       setFullName]       = useState('')
  const [phone,          setPhone]          = useState('')
  const [cedula,         setCedula]         = useState('')
  const [city,           setCity]           = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [avatarUrl,      setAvatarUrl]      = useState('')

  useEffect(() => {
    authService.me()
      .then(p => {
        setFullName(p.full_name || '')
        setPhone(p.phone        || '')
        setCedula(p.cedula      || '')
        setCity(p.city          || '')
        setBillingAddress(p.billing_address || '')
        setAvatarUrl(p.avatar   || '')
      })
      .catch(() => setFullName(user?.name || ''))
      .finally(() => setLoading(false))
  }, [])

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadService.image(file)
      setAvatarUrl(url)
      await authService.updateMe({ avatar: url })
      toast('Foto actualizada ✓', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateMe({
        full_name: fullName, phone, cedula, city,
        billing_address: billingAddress,
        avatar: avatarUrl || undefined,
      })
      toast('Perfil actualizado ✓', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const initials = (fullName || user?.name || 'U')[0]?.toUpperCase()

  return (
    <MainLayout>
      <div className="perfil">
        <div className="perfil__card">
          {/* Cabecera con foto */}
          <div className="perfil__header">
            <div className="perfil__avatar-wrap" onClick={() => fileRef.current?.click()} title="Cambiar foto">
              {avatarUrl
                ? <img src={avatarUrl} className="perfil__avatar-img" alt="avatar"
                    onError={() => setAvatarUrl('')} />
                : <div className="perfil__avatar">{initials}</div>
              }
              <div className="perfil__avatar-overlay">{uploading ? '⏳' : '📷'}</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={handlePhotoChange} />
            <div>
              <p className="perfil__name">{user?.name}</p>
              <p className="perfil__email">{user?.email}</p>
              <span className={`perfil__role ${user?.role === 'admin' ? '' : 'perfil__role--customer'}`}>
                {user?.role}
              </span>
              <p className="perfil__photo-hint">Toca la foto para cambiarla</p>
            </div>
          </div>

          {loading ? <div style={{ padding: '24px 0' }}><Spinner /></div> : (
            <>
              <div className="perfil__group">
                <label className="perfil__label">Nombre completo</label>
                <input className="perfil__input" type="text" value={fullName}
                  onChange={e => setFullName(e.target.value)} autoComplete="name" />
              </div>
              <div className="perfil__group">
                <label className="perfil__label">Teléfono</label>
                <input className="perfil__input" type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="perfil__group">
                <label className="perfil__label">Cédula</label>
                <input className="perfil__input" type="text" value={cedula}
                  onChange={e => setCedula(e.target.value)} />
              </div>
              <div className="perfil__group">
                <label className="perfil__label">Ciudad</label>
                <input className="perfil__input" type="text" value={city}
                  onChange={e => setCity(e.target.value)} />
              </div>
              <div className="perfil__group">
                <label className="perfil__label">Dirección de facturación</label>
                <input className="perfil__input" type="text" value={billingAddress}
                  onChange={e => setBillingAddress(e.target.value)} />
              </div>
              <button className="perfil__save-btn" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
