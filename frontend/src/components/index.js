// src/components/index.js
// Barrel de exportaciones — importa desde aquí en lugar de rutas largas

export { default as Navbar }      from './Navbar/Navbar'
export { default as Sidebar }     from './Sidebar/Sidebar'
export { default as Footer }      from './Footer/Footer'
export { default as FilterBar }   from './FilterBar/FilterBar'
export { default as ProductCard } from './ProductCard/ProductCard'
export { default as Stars }       from './Stars/Stars'
export { default as QtyControl }  from './QtyControl/QtyControl'
export { default as Spinner }     from './Spinner/Spinner'
export { default as Modal }       from './Modal/Modal'
export { default as Toast, useToast } from './Toast/Toast'
export { default as GoogleButton }  from './GoogleButton/GoogleButton'

// Utilidades
export function fmt(n) {
  return `$${Number(n).toLocaleString('es-CO')}`
}
