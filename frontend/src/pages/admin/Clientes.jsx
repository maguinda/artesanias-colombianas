// src/pages/admin/Clientes.jsx
import { useState, useEffect, useRef } from 'react'
import { customersService, uploadService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import MainLayout from '../../layouts/MainLayout'
import Modal      from '../../components/Modal/Modal'
import Spinner    from '../../components/Spinner/Spinner'
import { useToast } from '../../components/Toast/Toast'
import './Admin.css'

const ROLE_LABEL = { admin: 'Administrador', sale: 'Vendedor', customer: 'Cliente' }
const ROLE_BADGE = { admin: 'badge-gold',    sale: 'badge-green', customer: 'badge-gray' }

async function createClienteAPI(body) {
  const token = localStorage.getItem('ac_token')
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear cliente')
  return data
}

export default function Clientes() {
  const [customers,  setCustomers]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)  // null | 'edit' | 'create'
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileRef = useRef(null)
  const toast   = useToast()
  const { user } = useAuth()
  const isAdmin  = user?.role === 'admin'

  // Campos editar
  const [editId,      setEditId]      = useState(null)
  const [editName,    setEditName]    = useState('')
  const [editPhone,   setEditPhone]   = useState('')
  const [editCity,    setEditCity]    = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [editRole,    setEditRole]    = useState('customer')

  // Campos crear cliente
  const [cNombre,   setCNombre]   = useState('')
  const [cCedula,   setCCedula]   = useState('')
  const [cPhone,    setCPhone]    = useState('')
  const [cAddress,  setCAddress]  = useState('')
  const [cBarrio,   setCBarrio]   = useState('')
  const [cCity,     setCCity]     = useState('')
  const [cEmail,    setCEmail]    = useState('')
  const [cPassword, setCPassword] = useState('')
  const [cAvatar,   setCAvatar]   = useState('')

  const load = () => {
    customersService.getAll()
      .then(all => setCustomers(all.filter(c => c.role === 'customer')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openEdit = (c) => {
    setEditId(c.id); setEditName(c.full_name || ''); setEditPhone(c.phone || '')
    setEditCity(c.city || ''); setEditCountry(c.country || 'Colombia'); setEditRole(c.role || 'customer')
    setModal('edit')
  }

  const resetCreate = () => {
    setCNombre(''); setCCedula(''); setCPhone(''); setCAddress('')
    setCBarrio(''); setCCity(''); setCEmail(''); setCPassword(''); setCAvatar(''); setPreviewUrl('')
  }

  const openCreate = () => { resetCreate(); setModal('create') }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadService.image(file)
      setCAvatar(url); setPreviewUrl(url)
      toast('Foto subida ✓', 'success')
    } catch (err) { toast(err.message, 'error') }
    finally { setUploading(false) }
  }

  const handleCreate = async () => {
    if (!cNombre || !cEmail) { toast('Nombre y correo son obligatorios', 'error'); return }
    setSaving(true)
    try {
      await createClienteAPI({
        full_name: cNombre, cedula: cCedula, phone: cPhone,
        billing_address: cAddress, barrio: cBarrio, city: cCity,
        email: cEmail, password: cPassword || undefined,
        role: 'customer',  // siempre customer
        avatar: cAvatar || undefined,
      })
      toast('Cliente creado ✓', 'success')
      setModal(null); resetCreate(); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const payload = { full_name: editName, phone: editPhone, city: editCity, country: editCountry }
      if (isAdmin) payload.role = editRole
      await customersService.update(editId, payload)
      toast('Cliente actualizado ✓', 'success')
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try { await customersService.delete(id); toast('Cliente eliminado', 'success'); load() }
    catch (e) { toast(e.message, 'error') }
  }

  return (
    <MainLayout showFilter={false}>
      <div className="admin-page">
        <div className="admin-page__header">
          <h2 className="admin-page__title">Clientes</h2>
          <button className="inventario__create-btn" onClick={openCreate}>➕ CREAR CLIENTE</button>
        </div>

        {loading ? <Spinner /> : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>{['Nombre','Correo','Teléfono','Ciudad','Rol','Acciones'].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.avatar
                          ? <img src={c.avatar} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                          : <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{c.full_name?.[0]?.toUpperCase()}</div>
                        }
                        {c.full_name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-700)' }}>{c.email}</td>
                    <td style={{ color: 'var(--gray-700)' }}>{c.phone || '—'}</td>
                    <td style={{ color: 'var(--gray-700)' }}>{c.city || '—'}</td>
                    <td><span className={`badge ${ROLE_BADGE[c.role] || 'badge-gray'}`}>{ROLE_LABEL[c.role] || c.role}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="admin-btn-edit-sm" onClick={() => openEdit(c)}>✏️ Editar</button>
                        {isAdmin && <button className="admin-btn-danger-sm" onClick={() => handleDelete(c.id)}>🗑 Eliminar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && <div className="empty-state"><h3>No hay clientes registrados</h3></div>}
          </div>
        )}
      </div>

      {/* ── Modal CREAR CLIENTE ── */}
      {modal === 'create' && (
        <Modal title="Crear cliente" onClose={() => { setModal(null); resetCreate() }}>
          {/* Foto */}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          <div className="admin-form__img-zone" onClick={() => fileRef.current?.click()} style={{ marginBottom: 16 }}>
            {previewUrl
              ? <img src={previewUrl} className="admin-form__img-preview" alt="avatar" />
              : <div className="admin-form__img-placeholder">
                  <span style={{ fontSize: 32 }}>👤</span>
                  <span>{uploading ? 'Subiendo...' : 'Clic para agregar foto'}</span>
                </div>
            }
          </div>

          {[['Nombre *',  cNombre,   setCNombre,   'text'],
            ['Cédula',    cCedula,   setCCedula,   'text'],
            ['Teléfono',  cPhone,    setCPhone,    'tel'],
            ['Dirección', cAddress,  setCAddress,  'text'],
            ['Barrio',    cBarrio,   setCBarrio,   'text'],
            ['Ciudad',    cCity,     setCCity,     'text'],
            ['Correo *',  cEmail,    setCEmail,    'email'],
            ['Contraseña (def: Temporal123)', cPassword, setCPassword, 'password'],
          ].map(([label, val, setter, type]) => (
            <div key={label} className="admin-form__group">
              <label className="admin-form__label">{label}</label>
              <input className="admin-form__input" type={type} value={val} onChange={e => setter(e.target.value)} />
            </div>
          ))}

          <div className="admin-form__actions">
            <button className="admin-btn-save" onClick={handleCreate} disabled={saving || uploading}>
              {saving ? 'Guardando...' : 'Crear cliente'}
            </button>
            <button className="admin-btn-cancel" onClick={() => { setModal(null); resetCreate() }}>Cancelar</button>
          </div>
        </Modal>
      )}

      {/* ── Modal EDITAR ── */}
      {modal === 'edit' && (
        <Modal title="Editar cliente" onClose={() => setModal(null)}>
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
          {isAdmin && (
            <div className="admin-form__group">
              <label className="admin-form__label">Rol</label>
              <select className="admin-form__input" value={editRole} onChange={e => setEditRole(e.target.value)}>
                <option value="customer">Cliente</option>
                <option value="sale">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}
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
