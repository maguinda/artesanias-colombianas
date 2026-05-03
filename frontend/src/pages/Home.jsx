// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import { productsService } from '../services/api'
import { ProductCard, Spinner, FilterBar, fmt } from '../components'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast/Toast'
import { COLORS } from '../config/theme'

// Assets reales
import bannerImg from '../assets/images/banner.jpg'
import cat1 from '../assets/images/cat1.png'
import cat2 from '../assets/images/cat2.png'
import cat3 from '../assets/images/cat3.png'
import cat4 from '../assets/images/cat4.png'

const CATEGORIES = [
  { name: 'Mesa y cocina',    img: cat1 },
  { name: 'Accesorios',      img: cat2 },
  { name: 'Jarros y Floreros', img: cat3 },
  { name: 'Moda',            img: cat4 },
]

export default function Home() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterCat, setFilterCat] = useState('Todos')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [searchParams]            = useSearchParams()
  const navigate   = useNavigate()
  const { addItem } = useCart()
  const toast = useToast()
  const search = searchParams.get('search') || ''
  const limit  = 15

  useEffect(() => {
    setLoading(true)
    const params = { page, limit }
    if (filterCat !== 'Todos') params.category = filterCat
    productsService.getAll(params)
      .then(data => {
        let prods = data.products || []
        if (search) prods = prods.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
        setProducts(prods)
        setTotal(data.total || prods.length)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [page, filterCat, search])

  const pages = Math.ceil(total / limit) || 1

  const handleAddToCart = async (e, product) => {
    e.stopPropagation()
    try {
      await addItem(product, 1)
      toast('Producto agregado al carrito ✓', 'success')
    } catch (err) {
      toast(err.message || 'Inicia sesión para agregar al carrito', 'error')
    }
  }

  return (
    <showFilter filterActive={filterCat} onFilter={(cat) => { setFilterCat(cat); setPage(1) }}>
      {/* Banner */}
      <div style={{ width: '100%', maxHeight: 420, overflow: 'hidden' }}>
        <img src={bannerImg} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 20px' }}>

        {/* Categorías con Swiper */}
        <h2 style={{ color: COLORS.cafe_primario, fontSize: 26, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
          CATEGORÍAS
        </h2>
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={4}
          breakpoints={{ 320: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
          style={{ padding: '0 40px', marginBottom: 36 }}
        >
          {CATEGORIES.map((cat, i) => (
            <SwiperSlide key={i}>
              <div className="category-card" onClick={() => { setFilterCat(cat.name); setPage(1) }}>
                <img src={cat.img} alt={cat.name}
                  style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, boxShadow: '0 4px 8px rgba(0,0,0,.2)' }} />
                <p style={{ textAlign: 'center', marginTop: 8, fontWeight: 700, color: COLORS.cafe_primario }}>
                  {cat.name}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Grid de productos */}
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20, color: COLORS.negro }}>
          TODOS LOS PRODUCTOS
        </h2>

        {loading ? <Spinner /> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
              {products.map(p => (
                <div key={p.id || Math.random()} style={{ position: 'relative' }}>
                  <ProductCard product={p} onClick={() => p.id && navigate(`/producto/${p.id}`)} />
                  <button className="btn btn-primary btn-sm" onClick={e => handleAddToCart(e, p)}
                    style={{ position: 'absolute', bottom: 12, right: 12, borderRadius: 20, padding: '5px 12px', fontSize: 11 }}>
                    + Carrito
                  </button>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="empty-state"><h3>No se encontraron productos</h3></div>
            )}

            {/* Paginación */}
            <div className="pagination" style={{ marginTop: 28 }}>
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              {Array.from({ length: Math.min(pages, 5) }).map((_, i) => (
                <button key={i + 1} className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
