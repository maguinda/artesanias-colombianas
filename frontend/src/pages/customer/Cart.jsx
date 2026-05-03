// src/pages/customer/Cart.jsx
// Sin subcomponentes internos — todos los steps son JSX directo
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Cart.css'

import MainLayout  from '../../layouts/MainLayout'
import QtyControl  from '../../components/QtyControl/QtyControl'
import { useToast } from '../../components/Toast/Toast'
import { fmt }      from '../../components'

import { useCart } from '../../context/CartContext'
import { authService, ordersService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STEPS = ['Carrito de compras', 'Datos cliente', 'Envío', 'Método de pago', 'Resumen']

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo',        icon: '💵' },
  { id: 'tarjeta',  label: 'Tarjeta crédito', icon: '💳' },
]

const SHIPPING_COMPANIES = [
  { id: 'barbachos',       label: 'Barbachos',        icon: '🛵', cost: 8000  },
  { id: 'interrapidisimo', label: 'Interrapidísimo',  icon: '⚡', cost: 12000 },
  { id: 'coordinadora',    label: 'Coordinadora',     icon: '🔵', cost: 10000 },
  { id: 'punto_fisico',    label: 'Punto físico',     icon: '🏪', cost: 0     },
  { id: 'uber',            label: 'Uber mensajería',  icon: '⬛', cost: 15000 },
]

const FALLBACK_IMG = 'https://placehold.co/80x80/f5e6d3/2D1E0E?text=🎨'

export default function Cart() {
  const { items, total, updateQty, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const toast    = useToast()

  const { user } = useAuth()

  // Cargar datos del perfil del usuario al montar
  useEffect(() => {
    authService.me().then(profile => {
      if (profile.full_name) setNombre(profile.full_name.split(' ')[0] || '')
      if (profile.cedula)          setCedula(profile.cedula)
      if (profile.phone)           setCelular(profile.phone)
      if (profile.billing_address) setDireccion(profile.billing_address)
      if (profile.barrio)          setBarrio(profile.barrio)
      if (profile.city)            setCiudad(profile.city)
    }).catch(() => {})
  }, [])

  const [step, setStep]         = useState(0)
  const [payMethod, setPayMethod] = useState('efectivo')
  const [shippingCompany, setShippingCompany] = useState('barbachos')
  const [shippingCost, setShippingCost]       = useState(8000)
  const [shippingMethod, setShippingMethod]   = useState('contra_entrega')
  const [abono, setAbono]       = useState(0)
  const [loading, setLoading]   = useState(false)

  // Campos del cliente — un estado por campo para evitar pérdida de foco
  const [nombre,    setNombre]    = useState('')
  const [cedula,    setCedula]    = useState('')
  const [celular,   setCelular]   = useState('')
  const [direccion, setDireccion] = useState('')
  const [barrio,    setBarrio]    = useState('')
  const [ciudad,    setCiudad]    = useState('')
  const [detalles,  setDetalles]  = useState('')

  const grandTotal = total + shippingCost
  const selectedCompany = SHIPPING_COMPANIES.find(c => c.id === shippingCompany)
  const selectedMethod  = PAYMENT_METHODS.find(m => m.id === payMethod)

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  const renderBreadcrumb = () => (
    <div className="checkout-breadcrumb">
      {STEPS.map((s, i) => (
        <span key={i}>
          <span
            className={`checkout-breadcrumb__step ${
              step === i ? 'checkout-breadcrumb__step--active' :
              i < step   ? 'checkout-breadcrumb__step--done'   : ''
            }`}
            onClick={() => i < step && setStep(i)}
          >{s}</span>
          {i < STEPS.length - 1 && <span className="checkout-breadcrumb__sep"> &gt;&gt; </span>}
        </span>
      ))}
      {step > 0 && (
        <button className="checkout-breadcrumb__back" onClick={() => setStep(s => s - 1)}>
          ‹ VOLVER
        </button>
      )}
    </div>
  )

  // ── Resumen lateral (steps 1-4) ─────────────────────────────────────────────
  const renderSummary = (nextLabel, onNext) => (
    <div className="cart-summary">
      <p className="cart-summary__title">Carrito de compras</p>
      {items.map(item => (
        <div key={item.id} className="cart-summary__item">
          <img src={item.product_image || FALLBACK_IMG} className="cart-summary__img" alt={item.product_name} />
          <div style={{ flex: 1 }}>
            <p className="cart-summary__name">{item.product_name}</p>
            <p className="cart-summary__price">{fmt(item.price)} COP</p>
          </div>
          <QtyControl value={item.quantity} onChange={qty => updateQty(item.id, qty)} />
        </div>
      ))}
      <div className="cart-summary__divider" />
      <p className="cart-summary__subtotal">Subtotal <strong>{fmt(total)}</strong></p>
      <p className="cart-summary__note">El valor del envío varía con el destino.</p>
      <button className="cart-summary__btn" onClick={onNext} disabled={items.length === 0}>
        {nextLabel}
      </button>
    </div>
  )

  // ── STEP 0: Carrito ─────────────────────────────────────────────────────────
  const renderStep0 = () => (
    <div className="checkout-grid">
      <div className="checkout-panel">
        {items.length === 0 ? (
          <div className="cart-empty">
            <h3>Tu carrito está vacío</h3>
            <button className="cart-summary__btn" style={{ maxWidth: 200, margin: '0 auto' }} onClick={() => navigate('/')}>
              Ver productos
            </button>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="cart-item">
              <input type="checkbox" defaultChecked style={{ flexShrink: 0 }} />
              <img src={item.product_image || FALLBACK_IMG} className="cart-item__img" alt={item.product_name} />
              <div className="cart-item__info">
                <p className="cart-item__name">{item.product_name}</p>
                <p className="cart-item__price">{fmt(item.price)} COP</p>
              </div>
              <div className="cart-item__actions">
                <button className="cart-item__del" onClick={() => removeItem(item.id)}>🗑</button>
                <QtyControl value={item.quantity} onChange={qty => updateQty(item.id, qty)} />
              </div>
            </div>
          ))
        )}
      </div>

      <div>
        {/* Forma de pago rápida */}
        <div className="cart-summary" style={{ marginBottom: 14 }}>
          <p className="cart-summary__title">Forma de pago</p>
          <div className="payment-grid">
            {PAYMENT_METHODS.map(m => (
              <label key={m.id} className="payment-option">
                <input type="radio" name="pay0" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} />
                <span className="payment-option__icon">{m.icon}</span>
                <span>{m.label}</span>
              </label>
            ))}
          </div>
          <div className="cart-summary__divider" />
          <p className="cart-summary__title">Datos del cliente</p>
          <div className="client-fields">
            {[
              ['NOMBRE',    nombre,    setNombre],
              ['CÉDULA',    cedula,    setCedula],
              ['CELULAR',   celular,   setCelular],
              ['DIRECCIÓN', direccion, setDireccion],
              ['BARRIO',    barrio,    setBarrio],
              ['CIUDAD',    ciudad,    setCiudad],
              ['DETALLES',  detalles,  setDetalles],
            ].map(([label, val, setter]) => (
              <div key={label} className="client-field-row">
                <span className="client-field-label">{label}:</span>
                <input className="client-field-input" type="text" value={val}
                  onChange={e => setter(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-total">
          <span className="checkout-total__label">Total a cobrar:</span>
          <span className="checkout-total__value">{fmt(total)}</span>
        </div>
        <button className="cart-summary__btn" onClick={() => setStep(1)} disabled={items.length === 0}>
          Realizar compra
        </button>
      </div>
    </div>
  )

  // ── STEP 1: Datos cliente ───────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="checkout-grid">
      <div className="checkout-panel">
        <h2 className="checkout-panel__title">Datos del cliente</h2>
        {[
          ['NOMBRE',    nombre,    setNombre,    'text'],
          ['CÉDULA',    cedula,    setCedula,    'text'],
          ['CELULAR',   celular,   setCelular,   'tel'],
          ['DIRECCIÓN', direccion, setDireccion, 'text'],
          ['BARRIO',    barrio,    setBarrio,    'text'],
          ['CIUDAD',    ciudad,    setCiudad,    'text'],
          ['DETALLES',  detalles,  setDetalles,  'text'],
        ].map(([label, val, setter, type]) => (
          <div key={label} className="client-field-row" style={{ marginBottom: 14 }}>
            <span className="client-field-label">{label}:</span>
            <input className="client-field-input" type={type} value={val}
              onChange={e => setter(e.target.value)} />
          </div>
        ))}
        <button className="cart-summary__btn" style={{ maxWidth: 200, marginTop: 8 }} onClick={() => setStep(2)}>
          GUARDAR DATOS
        </button>
      </div>
      {renderSummary('IR A MÉTODO DE PAGO', () => setStep(2))}
    </div>
  )

  // ── STEP 2: Envío ───────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="checkout-grid">
      <div className="checkout-panel">
        <h2 className="checkout-panel__title">Envío</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 20 }}>Seleccione la empresa de mensajería.</p>
        {SHIPPING_COMPANIES.map(c => (
          <label key={c.id} className="shipping-option">
            <input type="radio" checked={shippingCompany === c.id}
              onChange={() => { setShippingCompany(c.id); setShippingCost(c.cost) }} />
            <span className="shipping-option__icon">{c.icon}</span>
            <span className="shipping-option__label">{c.label}</span>
          </label>
        ))}
      </div>

      <div>
        {renderSummary('IR A MÉTODO DE PAGO', () => setStep(3))}
        <div className="cart-summary" style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>Subtotal</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 14 }}>{fmt(total)}</p>

          <div className="client-field-row" style={{ marginBottom: 12 }}>
            <span className="client-field-label">Abono parcial</span>
            <span style={{ color: 'var(--gray-500)', marginRight: 4 }}>$</span>
            <input className="client-field-input" type="number" style={{ width: 90 }}
              value={abono} onChange={e => setAbono(+e.target.value)} />
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Método de envío</p>
          {[['contra_entrega', 'Contra entrega'], ['solo_envio', 'Solo envío']].map(([val, label]) => (
            <label key={val} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" checked={shippingMethod === val} onChange={() => setShippingMethod(val)} />
              {label}
            </label>
          ))}

          <div className="client-field-row" style={{ marginTop: 8 }}>
            <span className="client-field-label">Valor envío</span>
            <span style={{ color: 'var(--gray-500)', marginRight: 4 }}>$</span>
            <input className="client-field-input" type="number" style={{ width: 90 }}
              value={shippingCost} onChange={e => setShippingCost(+e.target.value)} />
          </div>

          <div className="cart-summary__divider" />
          <div className="checkout-total">
            <span className="checkout-total__label">Total a cobrar:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  // ── STEP 3: Método de pago ──────────────────────────────────────────────────
  const renderStep3 = () => (
    <div className="checkout-grid">
      <div className="checkout-panel">
        <h2 className="checkout-panel__title">Método de pago</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Seleccione el método de pago.</p>
        <div className="payment-grid">
          {PAYMENT_METHODS.map(m => (
            <label key={m.id} className="payment-option">
              <input type="radio" name="pay3" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} />
              <span className="payment-option__icon">{m.icon}</span>
              <span>{m.label}</span>
            </label>
          ))}
        </div>
        <button className="cart-summary__btn" style={{ maxWidth: 200, marginTop: 32 }} onClick={() => setStep(4)}>
          Ir a resumen
        </button>
      </div>
    </div>
  )

  // ── STEP 4: Resumen ─────────────────────────────────────────────────────────
  const renderStep4 = () => {
    const handleCreate = async () => {
      if (items.length === 0) { toast('Agrega al menos un producto', 'error'); return }
      setLoading(true)
      try {
        await ordersService.create({
          items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price, sku: i.sku })),
          shipping_address: direccion, barrio, city: ciudad,
          order_email: '', payment_method: payMethod,
          shipping_cost: shippingCost, shipping_company: selectedCompany?.label, notes: detalles,
        })
        toast('¡Orden creada exitosamente! 🎉', 'success')
        await clearCart()
        navigate('/mis-pedidos')
      } catch (err) {
        toast(err.message || 'Error al crear la orden', 'error')
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="checkout-grid">
        <div className="checkout-panel">
          <h2 className="checkout-panel__title">RESUMEN</h2>
          <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-500)', marginBottom: 14 }}>Carrito de compras</p>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <input type="checkbox" defaultChecked />
              <img src={item.product_image || FALLBACK_IMG} className="cart-item__img" alt={item.product_name} />
              <div className="cart-item__info">
                <p className="cart-item__name">{item.product_name}</p>
                <p className="cart-item__price">{fmt(item.price)} COP</p>
              </div>
              <QtyControl value={item.quantity} onChange={qty => updateQty(item.id, qty)} />
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="resumen-section">
            <p className="resumen-section__title">Método de pago</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>{selectedMethod?.icon}</span>
              <span style={{ fontWeight: 700 }}>{selectedMethod?.label}</span>
            </div>
          </div>
          <div className="cart-summary__divider" />

          <div className="resumen-section">
            <p className="resumen-section__title">Datos cliente</p>
            {[['NOMBRE', nombre], ['CÉDULA', cedula], ['CELULAR', celular],
              ['DIRECCIÓN', direccion], ['BARRIO', barrio], ['CIUDAD', ciudad]
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} className="resumen-row">
                <span className="resumen-row__label">{l}:</span>
                <span className="resumen-row__value">{v}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary__divider" />

          <div className="resumen-section">
            <p className="resumen-section__title">ENVÍO</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{selectedCompany?.icon}</span>
                <span style={{ fontWeight: 600 }}>{selectedCompany?.label}</span>
              </div>
              <span>Envío {fmt(shippingCost)}</span>
            </div>
          </div>
          <div className="cart-summary__divider" />

          <div className="checkout-total">
            <span className="checkout-total__label">Total a cobrar:</span>
            <span className="checkout-total__value">{fmt(grandTotal)}</span>
          </div>
          <button className="cart-summary__btn" onClick={handleCreate} disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="cart-page">
        {renderBreadcrumb()}
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </MainLayout>
  )
}
