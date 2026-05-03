// src/pages/admin/Inventario.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

import MainLayout from '../../layouts/MainLayout'
import Modal      from '../../components/Modal/Modal'
import Spinner    from '../../components/Spinner/Spinner'
import Stars      from '../../components/Stars/Stars'
import { useToast }        from '../../components/Toast/Toast'
import { fmt }             from '../../components'
import { productsService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { uploadService }   from '../../services/api'

export default function Inventario() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)   // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const toast    = useToast()
  const { user }  = useAuth()
  const isAdmin   = user?.role === 'admin'  // sale solo puede ver, no crear/editar/eliminar

  // Un estado por campo — evita bug de pérdida de foco
  const [sku,         setSku]         = useState('')
  const [name,        setName]        = useState('')
  const [price,       setPrice]       = useState('')
  const [stock,       setStock]       = useState('')
  const [category,    setCategory]    = useState('')
  const [weight,      setWeight]      = useState('')
  const [image,       setImage]       = useState('')
  const [description, setDescription] = useState('')

  const load = () => {
    setLoading(true)
    productsService.getAll({ source: 'local', limit: 100 })
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => {
    setSku(''); setName(''); setPrice(''); setStock('')
    setCategory(''); setWeight(''); setImage(''); setDescription('')
    setPreviewUrl(''); setSelected(null); setModal('create')
  }

  const openEdit = (p) => {
    setSku(p.sku || ''); setName(p.name || '')
    setPrice(String(p.price)); setStock(String(p.stock))
    setCategory(p.category || ''); setWeight(String(p.weight || ''))
    setImage(p.image || ''); setDescription(p.description || '')
    setPreviewUrl(p.image || '')
    setSelected(p); setModal('edit')
  }

  const openDelete = (p) => { setSelected(p); setModal('delete') }

  // Subir imagen al servidor
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadService.image(file)
      setImage(url)
      setPreviewUrl(url)
      toast('Imagen subida ✓', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!sku || !name || !price || !stock) {
      toast('Completa SKU, Nombre, Precio y Stock', 'error'); return
    }
    setSaving(true)
    try {
      const body = {
        sku, name,
        price:  parseFloat(price),
        stock:  parseInt(stock),
        category, weight: parseFloat(weight) || null,
        image, description
      }
      if (modal === 'create') await productsService.create(body)
      else                    await productsService.update(selected.id, body)
      toast(modal === 'create' ? 'Producto creado ✓' : 'Producto actualizado ✓', 'success')
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await productsService.delete(selected.id)
      toast('Producto eliminado', 'success')
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') }
    finally { setSaving(false) }
  }

  return (
    <MainLayout>
      <div className="admin-page">
        {/* Header con título y botón CREAR */}
        <div className="admin-page__header">
          <h2 className="admin-page__title">Inventario</h2>
          {isAdmin && (
            <button className="inventario__create-btn" onClick={openCreate}>
              ➕ CREAR PRODUCTO
            </button>
          )}
        </div>

        {loading ? <Spinner /> : (
          <div className="inventario__grid">
            {products.map(p => (
              <div key={p.id} className="inventario__card">
                <img
                  src={p.image || 'https://placehold.co/300x300/f5e6d3/2D1E0E?text=Artesanía'}
                  className="inventario__card-img"
                  alt={p.name}
                  onClick={() => navigate(`/producto/${p.id}`)}
                  onError={e => { e.target.src = 'https://placehold.co/300x300/f5e6d3/2D1E0E?text=Artesanía' }}
                />
                <div className="inventario__card-body">
                  <p className="inventario__card-name">{p.name}</p>
                  <Stars rating={5} />
                  <p className="inventario__card-stock">Stock: {p.stock}</p>
                  <p className="inventario__card-price">{fmt(p.price)}</p>
                  {isAdmin && (
                    <div className="inventario__card-actions">
                      <button className="inventario__btn-delete" onClick={() => openDelete(p)} title="Eliminar">🗑</button>
                      <button className="inventario__btn-edit"   onClick={() => openEdit(p)}   title="Editar">✏️</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <h3>No hay productos aún. Crea el primero.</h3>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Crear / Editar ── */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal
          title={modal === 'create' ? 'Crear producto' : 'Editar producto'}
          onClose={() => setModal(null)}
        >
          {/* Input oculto para archivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* Preview + botón de subir imagen */}
          <div className="admin-form__img-zone" onClick={() => fileInputRef.current?.click()}>
            {previewUrl
              ? <img src={previewUrl} className="admin-form__img-preview" alt="preview" />
              : <div className="admin-form__img-placeholder">
                  <span style={{ fontSize: 32 }}>📷</span>
                  <span>{uploading ? 'Subiendo...' : 'Clic para subir imagen'}</span>
                </div>
            }
            {uploading && <div className="admin-form__img-uploading">Subiendo...</div>}
          </div>
          {previewUrl && (
            <button className="admin-form__img-change"
              onClick={() => fileInputRef.current?.click()} type="button">
              Cambiar imagen
            </button>
          )}

          <div className="admin-form__group">
            <label className="admin-form__label">SKU *</label>
            <input className="admin-form__input" type="text" value={sku} onChange={e => setSku(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Nombre *</label>
            <input className="admin-form__input" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Precio *</label>
            <input className="admin-form__input" type="number" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Stock *</label>
            <input className="admin-form__input" type="number" value={stock} onChange={e => setStock(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Categoría</label>
            <input className="admin-form__input" type="text" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Peso (kg)</label>
            <input className="admin-form__input" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label className="admin-form__label">Descripción</label>
            <textarea
              className="admin-form__input admin-form__textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="admin-form__actions">
            <button className="admin-btn-save" onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button className="admin-btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </Modal>
      )}

      {/* ── Modal Eliminar ── */}
      {modal === 'delete' && (
        <Modal title="¿Eliminar producto?" onClose={() => setModal(null)}>
          <p style={{ color: 'var(--gray-700)', marginBottom: 24, fontSize: 14 }}>
            ¿Seguro que deseas eliminar <strong>{selected?.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="admin-form__actions">
            <button className="admin-btn-danger" onClick={handleDelete} disabled={saving}>
              {saving ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button className="admin-btn-cancel" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </MainLayout>
  )
}
