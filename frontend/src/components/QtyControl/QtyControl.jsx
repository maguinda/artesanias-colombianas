// src/components/QtyControl/QtyControl.jsx
import './QtyControl.css'

function QtyControl({ value, onChange, min = 1 }) {
  return (
    <div className="qty-control">
      <button className="qty-control__btn" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="qty-control__value">{value}</span>
      <button className="qty-control__btn" onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}

export default QtyControl
