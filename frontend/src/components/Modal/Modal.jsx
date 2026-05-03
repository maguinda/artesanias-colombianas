// src/components/Modal/Modal.jsx
import './Modal.css'

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        {title && <h2 className="modal__title">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export default Modal
