// src/pages/admin/CrearVenta.jsx
import { useState, useEffect } from 'react'
import { productsService, ordersService } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import { Stars, QtyControl, Spinner, fmt } from '../../components'
import { useToast } from '../../components/Toast/Toast'
import { useNavigate } from 'react-router-dom'

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

const FALLBACK = 'https://placehold.co/200x200/f0e6d2/7a4a1e?text=Artesanía'
const CARD_STYLE = { padding: '10px 12px' }
const ROW = { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }
const LBL = { width: 90, fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }

export default function CrearVenta() {
  const [step,      setStep]      = useState(0)
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [cartItems, setCartItems] = useState([])
  const [selected,  setSelected]  = useState(null)
  const [saving,    setSaving]    = useState(false)

  // Datos del cliente — un estado por campo para evitar pérdida de foco
  const [cNombre,    setCNombre]    = useState('')
  const [cCedula,    setCCedula]    = useState('')
  const [cEmail,     setCEmail]     = useState('')
  const [cCelular,   setCCelular]   = useState('')
  const [cDireccion, setCDireccion] = useState('')
  const [cBarrio,    setCBarrio]    = useState('')
  const [cCiudad,    setCCiudad]    = useState('')
  const [cDetalles,  setCDetalles]  = useState('')

  // Envío
  const [shippingCompany, setShippingCompany] = useState('barbachos')
  const [shippingMethod,  setShippingMethod]  = useState('contra_entrega')
  const [shippingCost,    setShippingCost]    = useState(8000)
  const [abono,           setAbono]           = useState(0)

  const [payMethod, setPayMethod] = useState('efectivo')

  const toast    = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    productsService.getAll({ limit: 100 })
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered   = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
  const subtotal   = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const grandTotal = subtotal + shippingCost

  const addToCart = (product) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.product_id === product.id)
      if (idx !== -1) {
        const next = [...prev]
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 }
        return next
      }
      return [...prev, {
        product_id:    product.id,
        product_name:  product.name,
        product_image: product.image || product.thumbnail || '',
        price:         product.price,
        quantity:      1,
        sku:           product.sku || String(product.id),
      }]
    })
    toast(`${product.name} agregado`, 'success')
  }

  const updateQty  = (pid, qty) => setCartItems(p => p.map(i => i.product_id === pid ? { ...i, quantity: qty } : i))
  const removeItem = (pid)      => setCartItems(p => p.filter(i => i.product_id !== pid))

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  const renderBreadcrumb = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
      {STEPS.map((s, i) => (
        <span key={i}>
          <span onClick={() => i < step && setStep(i)} style={{
            fontSize: 13, fontWeight: step === i ? 700 : 500,
            color: step === i ? 'var(--gold)' : 'var(--gray-500)',
            cursor: i < step ? 'pointer' : 'default',
            textDecoration: i < step ? 'underline' : 'none',
          }}>{s}</span>
          {i < STEPS.length - 1 && <span style={{ color: 'var(--gray-300)', fontSize: 13 }}> &gt;&gt; </span>}
        </span>
      ))}
      {step > 0 && (
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}
          onClick={() => setStep(s => s - 1)}>‹ VOLVER</button>
      )}
    </div>
  )

  // ── Resumen lateral ─────────────────────────────────────────────────────────
  const renderSummary = (nextLabel, onNext) => (
    <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Carrito de compras</h3>
      {cartItems.length === 0
        ? <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Sin productos aún</p>
        : cartItems.map(item => (
          <div key={item.product_id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
            <img src={item.product_image || FALLBACK}
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} alt={item.product_name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.3 }}>{item.product_name}</div>
              <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>{fmt(item.price)} COP</div>
            </div>
            <QtyControl value={item.quantity} onChange={qty => updateQty(item.product_id, qty)} />
          </div>
        ))
      }
      <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', margin: '12px 0' }} />
      <div style={{ marginBottom: 6, fontSize: 13 }}>
        Subtotal <strong style={{ color: 'var(--brown)', fontSize: 18, marginLeft: 8 }}>{fmt(subtotal)}</strong>
      </div>
      <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 14 }}>
        El valor del envío varía con el destino y el valor total de los artículos seleccionados.
      </p>
      <button className="btn btn-primary btn-full" onClick={onNext} disabled={cartItems.length === 0}
        style={{ padding: 12 }}>{nextLabel}</button>
    </div>
  )

  // ── STEP 0: Buscar productos ────────────────────────────────────────────────
  const renderStep0 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Buscar productos</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input className="form-input" style={{ width: '100%', paddingRight: 40 }}
              placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)' }}>🔍</span>
          </div>
          <button className="btn btn-primary" disabled={!selected}
            onClick={() => selected && addToCart(selected)}>
            Agregar al carrito
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelected(p)} style={{
                borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                border: `2px solid ${selected?.id === p.id ? 'var(--gold)' : 'transparent'}`,
                background: selected?.id === p.id ? '#fdf8f2' : 'var(--white)',
                boxShadow: 'var(--shadow)', transition: 'all .15s',
              }}>
                <img src={p.image || p.thumbnail || FALLBACK} alt={p.name}
                  onError={e => { e.target.src = FALLBACK }}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <div style={CARD_STYLE}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
                  <Stars rating={5} />
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 2 }}>Stock: {p.stock ?? 10}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{fmt(p.price)}</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <h3>No se encontraron productos</h3>
              </div>
            )}
          </div>
        )}
      </div>
      {renderSummary('Ir a datos clientes', () => setStep(1))}
    </div>
  )

  // ── STEP 1: Datos cliente — inputs directos, sin .map ─────────────────────
  const renderStep1 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Datos del cliente</h2>

        <div style={ROW}>
          <label style={LBL}>NOMBRE:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="text"
            value={cNombre} onChange={e => setCNombre(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>CÉDULA:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="text"
            value={cCedula} onChange={e => setCCedula(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>EMAIL:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="email"
            value={cEmail} onChange={e => setCEmail(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>CELULAR:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="tel"
            value={cCelular} onChange={e => setCCelular(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>DIRECCIÓN:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="text"
            value={cDireccion} onChange={e => setCDireccion(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>BARRIO:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="text"
            value={cBarrio} onChange={e => setCBarrio(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>CIUDAD:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="text"
            value={cCiudad} onChange={e => setCCiudad(e.target.value)} />
        </div>
        <div style={ROW}>
          <label style={LBL}>DETALLES:</label>
          <input className="admin-form__input" style={{ flex: 1 }} type="text"
            value={cDetalles} onChange={e => setCDetalles(e.target.value)} />
        </div>

        <button className="admin-btn-save" style={{ marginTop: 8 }} onClick={() => setStep(2)}>
          GUARDAR DATOS
        </button>
      </div>
      {renderSummary('IR A MÉTODO DE PAGO', () => setStep(2))}
    </div>
  )

  // ── STEP 2: Envío ───────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Envío</h2>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>Seleccione la empresa de mensajería.</p>
        {SHIPPING_COMPANIES.map(c => (
          <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, cursor: 'pointer' }}>
            <input type="radio" checked={shippingCompany === c.id}
              onChange={() => { setShippingCompany(c.id); setShippingCost(c.cost) }} />
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <span style={{ fontWeight: 600 }}>{c.label}</span>
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {renderSummary('IR A MÉTODO DE PAGO', () => setStep(3))}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Subtotal</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{fmt(subtotal)}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Abono parcial</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--gray-500)' }}>$</span>
              <input className="form-input" style={{ width: 90, textAlign: 'right' }} type="number"
                value={abono} onChange={e => setAbono(+e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Método de envío</div>
            {[['contra_entrega', 'Contra entrega'], ['solo_envio', 'Solo envío']].map(([val, lbl]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" checked={shippingMethod === val} onChange={() => setShippingMethod(val)} />
                {lbl}
              </label>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Valor del envío</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--gray-500)' }}>$</span>
              <input className="form-input" style={{ width: 100, textAlign: 'right' }} type="number"
                value={shippingCost} onChange={e => setShippingCost(+e.target.value)} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Total a cobrar:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  // ── STEP 3: Método de pago ──────────────────────────────────────────────────
  const renderStep3 = () => (
    <div style={{ maxWidth: 500 }}>
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Método de pago</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Seleccione el método de pago.</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {PAYMENT_METHODS.map(m => (
            <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              <input type="radio" name="pay" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} />
              <span style={{ fontSize: 26 }}>{m.icon}</span>
              <span>{m.label}</span>
            </label>
          ))}
        </div>
        <button className="admin-btn-save" style={{ marginTop: 32 }} onClick={() => setStep(4)}>
          Ir a resumen
        </button>
      </div>
    </div>
  )

  // ── STEP 4: Resumen ─────────────────────────────────────────────────────────
  const renderStep4 = () => {
    const company = SHIPPING_COMPANIES.find(c => c.id === shippingCompany)
    const method  = PAYMENT_METHODS.find(m => m.id === payMethod)

    const handleCreate = async () => {
      if (cartItems.length === 0) return toast('Agrega al menos un producto', 'error')
      setSaving(true)
      try {
        await ordersService.create({
          items: cartItems.map(i => ({
            product_id: i.product_id, quantity: i.quantity, price: i.price, sku: i.sku,
          })),
          shipping_address: cDireccion,
          barrio:           cBarrio,
          city:             cCiudad,
          order_email:      cEmail,
          payment_method:   payMethod,
          shipping_cost:    shippingCost,
          shipping_company: company?.label,
          notes:            cDetalles,
          nombre_cliente:   cNombre,
          cedula_cliente:   cCedula,
          celular_cliente:  cCelular,
        })
        toast('¡Venta creada exitosamente! 🎉', 'success')
        navigate('/admin/envios')
      } catch (err) {
        toast(err.message || 'Error al crear la venta', 'error')
      } finally {
        setSaving(false)
      }
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>RESUMEN</h2>
          <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-500)', marginBottom: 14 }}>Carrito de compras</p>
          {cartItems.map(item => (
            <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--cream-dark)' }}>
              <img src={item.product_image || FALLBACK}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} alt={item.product_name} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.product_name}</div>
                <div style={{ color: 'var(--green)', fontWeight: 700, marginTop: 4 }}>{fmt(item.price)} COP</div>
              </div>
              <QtyControl value={item.quantity} onChange={qty => updateQty(item.product_id, qty)} />
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Método de pago</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>{method?.icon}</span>
            <span style={{ fontWeight: 700 }}>{method?.label}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', margin: '12px 0' }} />
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Datos cliente</h3>
          {[['NOMBRE', cNombre], ['CÉDULA', cCedula], ['EMAIL', cEmail],
            ['CELULAR', cCelular], ['DIRECCIÓN', cDireccion], ['BARRIO', cBarrio], ['CIUDAD', cCiudad]
          ].filter(([, v]) => v).map(([l, v]) => (
            <div key={l} style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: 13 }}>
              <span style={{ fontWeight: 700, width: 80, flexShrink: 0 }}>{l}:</span>
              <span style={{ color: 'var(--gray-700)' }}>{v}</span>
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', margin: '12px 0' }} />
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>ENVÍO</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{company?.icon}</span>
              <span style={{ fontWeight: 600 }}>{company?.label}</span>
            </div>
            <span>Envío {fmt(shippingCost)}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--cream-dark)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <span style={{ fontWeight: 600 }}>Total a cobrar:</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>{fmt(grandTotal)}</span>
          </div>
          <button className="admin-btn-save btn-full" onClick={handleCreate} disabled={saving}
            style={{ padding: 14, fontSize: 15, width: '100%' }}>
            {saving ? 'Creando venta...' : 'Crear venta'}
          </button>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      <div style={{ padding: '24px 28px' }}>
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
