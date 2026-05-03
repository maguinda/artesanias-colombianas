// src/components/ProductCard/ProductCard.jsx
import './ProductCard.css'
import Stars from '../Stars/Stars'

const FALLBACK = 'https://placehold.co/300x300/f5e6d3/2D1E0E?text=Artesanía'

function fmt(n) {
  return `$${Number(n).toLocaleString('es-CO')}`
}

function ProductCard({ product, onClick, onAddToCart }) {
  const img = product.image || product.thumbnail || product.img || FALLBACK

  return (
    <div className="product-card" onClick={onClick}>
      <img
        src={img}
        className="product-card__img"
        alt={product.name}
        onError={(e) => { e.target.src = FALLBACK }}
      />
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <Stars rating={5} />
        <p className="product-card__stock">Stock: {product.stock ?? 10}</p>
        <p className="product-card__price">{fmt(product.price)}</p>
      </div>
      {onAddToCart && (
        <button
          className="product-card__add-btn"
          onClick={(e) => { e.stopPropagation(); onAddToCart(product) }}
        >
          + Carrito
        </button>
      )}
    </div>
  )
}

export default ProductCard
