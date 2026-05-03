// src/components/FilterBar/FilterBar.jsx
import './FilterBar.css'
import filterIcon from '../../assets/icons/filtrar.png'

const CATS = ['Todos', 'Porcelana', 'Ruanas', 'Cuadros', 'Accesorios', 'Bebé', 'Baño']

function FilterBar({ active = 'Todos', onFilter }) {
  return (
    <div className="filterbar">
      <div className="filterbar__label">
        <img src={filterIcon} alt="filtro" />
        <span>Filtrar por...</span>
      </div>
      <div className="filterbar__divider" />
      <div className="filterbar__cats">
        {CATS.map(cat => (
          <button
            key={cat}
            className={`filterbar__btn ${active === cat ? 'filterbar__btn--active' : ''}`}
            onClick={() => onFilter?.(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterBar
