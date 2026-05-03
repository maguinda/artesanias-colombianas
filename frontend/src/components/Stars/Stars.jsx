// src/components/Stars/Stars.jsx
import './Stars.css'

function Stars({ rating = 5, max = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < rating ? 'stars__star' : 'stars__star--empty'}>★</span>
      ))}
    </div>
  )
}

export default Stars
