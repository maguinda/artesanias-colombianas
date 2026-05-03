// src/pages/ProductDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsService } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import { Stars, QtyControl, ProductCard, Spinner, fmt } from '../../components'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../components/Toast/Toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    productsService.getOne(id)
      .then(setProduct)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
    productsService.getAll({ limit: 10 })
      .then(d => setRelated((d.products || []).slice(0, 10)))
      .catch(() => {})
  }, [id])

  const handleAdd = async () => {
    try {
      await addItem(product, qty)
      toast('Producto agregado al carrito ✓', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <MainLayout showFilter={false}><div style={{padding:40}}><Spinner /></div></MainLayout>
  if (!product) return null

  const img = product.image || product.thumbnail || 'https://placehold.co/500x500/f0e6d2/7a4a1e?text=Artesanía'

  return (
    <MainLayout showFilter={false}>
      {/* Main product section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 48, maxWidth: 900 }}>
        {/* Images */}
        <div>
          <img src={img} alt={product.name}
            onError={e=>e.target.src='https://placehold.co/500x500/f0e6d2/7a4a1e?text=Artesanía'}
            style={{ width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '1', boxShadow: 'var(--shadow)' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[img,img,img,img].map((src, i) => (
              <img key={i} src={src} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i===0?'2px solid var(--gold)':'2px solid transparent', opacity: i===0?1:.6 }} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 12 }}>{product.name?.toUpperCase()}</h1>
          <div style={{ color: 'var(--green)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{fmt(product.price)}</div>
          <Stars rating={5} />
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--gray-700)' }}>Stock: {product.stock ?? 10}</p>
          {product.description && <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.7, color: 'var(--gray-700)' }}>{product.description}</p>}

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <QtyControl value={qty} onChange={setQty} />
          </div>
          <button className="btn btn-primary" onClick={handleAdd} style={{ marginTop: 20, padding: '14px 36px', fontSize: 15, borderRadius: 10 }}>
            Añadir al carrito
          </button>
        </div>
      </div>

      {/* Related products */}
      <h2 className="section-title">COMPLEMENTA TU COMPRA</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 18 }}>
        {related.filter(p => String(p.id) !== id).slice(0,10).map(p => (
          <ProductCard key={p.id} product={p} onClick={() => navigate(`/producto/${p.id}`)} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {[1,2,3,4,5].map(n=>(
          <button key={n} className={`page-btn ${n===3?'active':''}`}>{n}</button>
        ))}
      </div>
    </MainLayout>
  )
}
