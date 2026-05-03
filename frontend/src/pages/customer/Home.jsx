// src/pages/customer/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import './Home.css'

import MainLayout  from '../../layouts/MainLayout'
import ProductCard from '../../components/ProductCard/ProductCard'
import Spinner     from '../../components/Spinner/Spinner'
import { useToast } from '../../components/Toast/Toast'
import { fmt } from '../../components'

import { productsService } from '../../services/api'
import { useCart } from '../../context/CartContext'

import bannerImg from '../../assets/images/banner.jpg'
import cat1 from '../../assets/images/cat1.png'
import cat2 from '../../assets/images/cat2.png'
import cat3 from '../../assets/images/cat3.png'
import cat4 from '../../assets/images/cat4.png'

const CATEGORIES = [
  { name: 'Mesa y cocina',     img: cat1 },
  { name: 'Accesorios',        img: cat2 },
  { name: 'Jarros y Floreros', img: cat3 },
  { name: 'Moda',              img: cat4 },
]

const LIMIT = 15

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

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: LIMIT }
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

  const pages = Math.max(1, Math.ceil(total / LIMIT))

  const handleFilter = (cat) => { setFilterCat(cat); setPage(1) }

  const handleAddToCart = async (product) => {
    try {
      await addItem(product, 1)
      toast('Producto agregado al carrito ✓', 'success')
    } catch {
      toast('Inicia sesión para agregar al carrito', 'error')
    }
  }

  return (
    <MainLayout showFilter filterActive={filterCat} onFilter={handleFilter}>

      {/* Banner */}
      <div className="home__banner">
        <img src={bannerImg} alt="banner artesanías colombianas" />
      </div>

      <div className="home__content">

        {/* Categorías */}
        <h2 className="home__section-title">CATEGORÍAS</h2>
        <div className="home__categories">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={4}
            breakpoints={{ 320: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
            style={{ padding: '0 40px' }}
          >
            {CATEGORIES.map((cat, i) => (
              <SwiperSlide key={i}>
                <div className="home__cat-card" onClick={() => handleFilter(cat.name)}>
                  <img src={cat.img} className="home__cat-img" alt={cat.name} />
                  <p className="home__cat-name">{cat.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Productos */}
        <h2 className="home__section-title home__section-title--left">TODOS LOS PRODUCTOS</h2>

        {loading ? <Spinner /> : (
          <>
            <div className="home__product-grid">
              {products.map((p, i) => (
                <ProductCard
                  key={p.id || i}
                  product={p}
                  onClick={() => p.id && navigate(`/producto/${p.id}`)}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {products.length === 0 && (
              <div className="home__empty">
                <h3>No se encontraron productos</h3>
              </div>
            )}

            {/* Paginación */}
            <div className="home__pagination">
              <button className="home__page-btn" onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              {Array.from({ length: Math.min(pages, 5) }).map((_, i) => (
                <button
                  key={i + 1}
                  className={`home__page-btn ${page === i + 1 ? 'home__page-btn--active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="home__page-btn" onClick={() => setPage(p => Math.min(pages, p + 1))}>›</button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}
