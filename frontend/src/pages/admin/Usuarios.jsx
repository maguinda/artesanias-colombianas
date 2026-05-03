// src/pages/admin/Usuarios.jsx
import { useState, useEffect, useRef } from 'react'
import { customersService, uploadService } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import Modal      from '../../components/Modal/Modal'
import Spinner    from '../../components/Spinner/Spinner'
import { useToast } from '../../components/Toast/Toast'
import { useAuth }   from '../../context/AuthContext'
import './Admin.css'

async function createCustomer(body) {
  const token = localStorage.getItem('ac_token')
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear usuario')
  return data
}

const ROLE_LABEL = { admin: 'ADMINISTRADOR', sale: 'VENDEDOR', customer: 'VENDEDOR/CLIENTE' }
const ROLE_COLOR = { admin: 'var(--gold)', sale: '#27ae60', customer: 'var(--gray-500)' }

export default function Usuarios() {
  const { user: me } = useAuth()
  const toast = useToast()
  const fileRef = useRef(null)

  // Lista
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [mode,    setMode]    = useState('list')  // 'list' | 'create'
  const [modal,   setModal]   = useState(null)    // null | 'view' | 'edit'
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)

  // Foto en modo crear
  const [avatarUrl,  setAvatarUrl]  = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading,  setUploading]  = useState(false)

  // Campos crear usuario
  const [fullName,  setFullName]  = useState('')
  const [cedula,    setCedula]    = useState('')
  const [phone,     setPhone]     = useState('')
  const [address,   setAddress]   = useState('')
  const [barrio,    setBarrio]    = useState('')
  const [city,      setCity]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [role,      setRole]      = useState('customer')

  // Campos editar
  const [editName,    setEditName]    = useState('')
  const [editPhone,   setEditPhone]   = useState('')
  const [editCity,    setEditCity]    = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editRole,    setEditRole]    = useState('customer')

  const load = () => {
    customersService.getAll()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const resetForm = () => {
    setFullName(''); setCedula(''); setPhone(''); setAddress('')
    setBarrio(''); setCity(''); setEmail(''); setPassword(''); setRole('customer')
    setAvatarUrl(''); setPreviewUrl('')
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadService.image(file)
      setAvatarUrl(url); setPreviewUrl(url)
      toast('Foto subida ✓', 'success')
    } catch (err) { toast(err.message, 'error') }
    finally { setUploading(false) }
  }

  const openView = (u) => { setSelected(u); setModal('view') }

  const openEdit = (u) => {
    setSelected(u)
    setEditName(u.full_name || ''); setEditPhone(u.phone || '')
    setEditCity(u.city || ''); setEditCountry(u.country || 'Colombia'); setEditRole(u.role || 'customer')
    setModal('edit')
  }

  const handleCreate = async () => {
    if (!fullName || !email) { toast('Nombre y correo son obligatorios', 'error'); return }
    if (!email.includes('@')) { toast('El correo no es válido', 'error'); return }
    setSaving(true)
    try {
      await createCustomer({ full_name: fullName, cedula, phone, billing_address: address, barrio, city, email, password, role, avatar: avatarUrl || undefined })
      toast('Usuario creado ✓', 'success')
      resetForm(); setMode('list'); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await customersService.update(selected.id, {
        full_name: editName, phone: editPhone, city: editCity, country: editCountry, role: editRole,
      })
      toast('Usuario actualizado ✓', 'success')
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await customersService.delete(id)
      toast('Usuario eliminado', 'success')
      load()
    } catch (e) { toast(e.message, 'error') }
  }

  const renderCard = (u, isMe) => (
    <div key={u.id} className={`usuario-card ${isMe ? 'usuario-card--me' : ''}`}>
      <div className="usuario-card__info">
        {/* Avatar con foto real si existe */}
        <div className="usuario-card__avatar" style={{ background: 'none', overflow: 'hidden' }}>
          {u.avatar
            ? <img src={u.avatar} alt={u.full_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                onError={e => { e.target.style.display='none' }} />
            : <span style={{ fontSize: 28 }}>👤</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <p className="usuario-card__name">{u.full_name}</p>
          <p className="usuario-card__role" style={{ color: ROLE_COLOR[u.role] }}>
            {ROLE_LABEL[u.role] || u.role.toUpperCase()}
          </p>
          {u.phone && <p className="usuario-card__detail">{u.phone}</p>}
          {u.city  && <p className="usuario-card__detail">{u.city}</p>}
        </div>
      </div>
      <div className="usuario-card__actions">
        <button className="usuario-card__btn usuario-card__btn--view" title="Ver detalles"
          onClick={() => openView(u)}>👁</button>
        <button className="usuario-card__btn usuario-card__btn--edit" title="Editar"
          onClick={() => openEdit(u)}>✏️</button>
        {!isMe && (
          <button className="usuario-card__btn" title="Eliminar"
            style={{ background: 'var(--red)' }}
            onClick={() => handleDelete(u.id)}>🗑</button>
        )}
      </div>
    </div>
  )

  // ── Modo crear ──────────────────────────────────────────────────────────────
  if (mode === 'create') return (
    <MainLayout showFilter={false}>
      <div className="admin-page">
        <div style={{ maxWidth: 860, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 24, background: 'var(--cream-dark)', padding: '12px 16px', borderRadius: 8 }}>
              AGREGAR USUARIO
            </h2>

            {/* Campos del formulario — directos sin .map para evitar pérdida de foco */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>NOMBRE *:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>CÉDULA:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="text" value={cedula} onChange={e => setCedula(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>CELULAR:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>DIRECCIÓN:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="text" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>BARRIO:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="text" value={barrio} onChange={e => setBarrio(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>CIUDAD:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="text" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>CORREO *:</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>CONTRASEÑA (def: Temporal123):</label>
              <input className="admin-form__input" style={{ flex: 1 }} type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <label style={{ width: 220, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>CARGO:</label>
              <select className="admin-form__input" style={{ flex: 1 }} value={role} onChange={e => setRole(e.target.value)}>
                <option value="customer">CLIENTE</option>
                <option value="sale">VENDEDOR</option>
                <option value="admin">ADMINISTRADOR</option>
              </select>
            </div>

            <button className="admin-btn-save" style={{ padding: '12px 32px' }}
              onClick={handleCreate} disabled={saving || uploading}>
              {saving ? 'Guardando...' : 'GUARDAR DATOS'}
            </button>
          </div>

          {/* Foto */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
            <div onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--gray-300)', borderRadius: 10, aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 12, overflow: 'hidden', position: 'relative' }}>
              {previewUrl
                ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
                : <span style={{ fontSize: 48, color: 'var(--gray-300)' }}>+</span>
              }
              {uploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--gold)' }}>
                  Subiendo...
                </div>
              )}
            </div>
            <button className="admin-btn-cancel" style={{ width: '100%' }} type="button"
              onClick={() => fileRef.current?.click()}>
              {previewUrl ? 'CAMBIAR FOTO' : 'AGREGAR FOTO'}
            </button>
          </div>
        </div>

        <button className="admin-btn-cancel" style={{ marginTop: 24 }}
          onClick={() => { resetForm(); setMode('list') }}>
          ‹ VOLVER
        </button>
      </div>
    </MainLayout>
  )

  // ── Modo lista ──────────────────────────────────────────────────────────────
  const myCard = users.find(u => u.id === me?.id)
  const others  = users.filter(u => u.id !== me?.id)

  return (
    <MainLayout showFilter={false}>
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">USUARIOS</h2>
          <button className="inventario__create-btn" onClick={() => setMode('create')}>
            ➕ CREAR USUARIOS
          </button>
        </div>

        {loading ? <Spinner /> : (
          <>
            {myCard && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', marginBottom: 20 }} />
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>MI PERFIL</h3>
                <div style={{ maxWidth: 320, marginBottom: 32 }}>{renderCard(myCard, true)}</div>
              </>
            )}
            <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', marginBottom: 20 }} />
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>OTROS USUARIOS</h3>
            <div className="usuarios__grid">
              {others.map(u => renderCard(u, false))}
              {others.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <h3>No hay otros usuarios registrados</h3>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal VER */}
      {modal === 'view' && selected && (
        <Modal title="Detalles del usuario" onClose={() => setModal(null)}>
          {selected.avatar && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img src={selected.avatar} alt="avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cream-dark)' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            {[
              ['Nombre',     selected.full_name],
              ['Correo',     selected.email],
              ['Teléfono',   selected.phone],
              ['Cédula',     selected.cedula],
              ['Ciudad',     selected.city],
              ['País',       selected.country],
              ['Rol',        ROLE_LABEL[selected.role] || selected.role],
              ['Registrado', selected.created_at ? new Date(selected.created_at).toLocaleDateString('es-CO') : '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontWeight: 700, width: 100, flexShrink: 0, color: 'var(--gray-700)' }}>{l}:</span>
                <span style={{ color: v ? 'var(--brown)' : 'var(--gray-300)' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
          <div className="admin-form__actions" style={{ marginTop: 20 }}>
            <button className="admin-btn-save" onClick={() => { setModal(null); openEdit(selected) }}>Editar</button>
            <button className="admin-btn-cancel" onClick={() => setModal(null)}>Cerrar</button>
          </div>
        </Modal>
      )}

      {/* Modal EDITAR */}
      {modal === 'edit' && selected && (
        <Modal title={`Editar: ${selected.full_name}`} onClose={() => setModal(null)}>
          <div className="admin-form__group">
            <label className="admin-form__label">Nombre completo</label>
            <input className="admin-form__input" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Teléfono</label>
            <input className="admin-form__input" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Ciudad</label>
            <input className="admin-form__input" type="text" value={editCity} onChange={e => setEditCity(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">País</label>
            <input className="admin-form__input" type="text" value={editCountry} onChange={e => setEditCountry(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Rol</label>
            <select className="admin-form__input" value={editRole} onChange={e => setEditRole(e.target.value)}>
              <option value="customer">CLIENTE</option>
              <option value="sale">VENDEDOR</option>
              <option value="admin">ADMINISTRADOR</option>
            </select>
          </div>
          <div className="admin-form__actions">
            <button className="admin-btn-save" onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button className="admin-btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </MainLayout>
  )
}
