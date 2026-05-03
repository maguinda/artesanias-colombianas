// src/pages/customer/MisPedidos.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersService } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import { Spinner, fmt } from '../../components'
import './MisPedidos.css'

const STATUS = {
  pendiente: { cls: 'badge-gray',  label: 'Pendiente' },
  pagado:    { cls: 'badge-green', label: 'Pagado'    },
  enviado:   { cls: 'badge-gold',  label: 'Enviado'   },
  entregado: { cls: 'badge-green', label: 'Entregado' },
  cancelado: { cls: 'badge-red',   label: 'Cancelado' },
}

export default function MisPedidos() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(null)   // id de la orden expandida
  const [details, setDetails] = useState({})     // { orderId: [items...] }
  const navigate = useNavigate()

  useEffect(() => {
    ordersService.getAll()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (o) => {
    const newOpen = open === o.id ? null : o.id
    setOpen(newOpen)
    // Cargar detalle si aún no lo tenemos
    if (newOpen && !details[o.id]) {
      try {
        const full = await ordersService.getOne(o.id)
        setDetails(d => ({ ...d, [o.id]: full.items || [] }))
      } catch { setDetails(d => ({ ...d, [o.id]: [] })) }
    }
  }

  const canPay = (o) => o.order_status === 'pendiente'

  return (
    <MainLayout>
      <div className="mispedidos">
        <h2 className="mispedidos__title">Mis pedidos</h2>

        {loading ? <Spinner /> : orders.length === 0 ? (
          <div className="empty-state"><h3>No tienes pedidos aún</h3></div>
        ) : (
          <div className="mispedidos__list">
            {orders.map(o => {
              const sc = STATUS[o.order_status] || STATUS.pendiente
              const isOpen = open === o.id
              const items  = details[o.id] || []

              return (
                <div key={o.id} className={`mispedidos__card ${isOpen ? 'mispedidos__card--open' : ''}`}>
                  {/* Cabecera */}
                  <div className="mispedidos__header" onClick={() => toggle(o)}>
                    <div className="mispedidos__info">
                      <span className="mispedidos__num">Orden #{o.id}</span>
                      <span className="mispedidos__date">
                        {new Date(o.order_date).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' })}
                      </span>
                    </div>
                    <div className="mispedidos__meta">
                      <span className={`badge ${sc.cls}`}>{sc.label}</span>
                      <span className="mispedidos__total">{fmt(o.amount)}</span>
                      <span className="mispedidos__arrow">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {isOpen && (
                    <div className="mispedidos__detail">
                      {/* Productos */}
                      <div className="mispedidos__section">
                        <h4 className="mispedidos__section-title">Productos</h4>
                        {items.length === 0
                          ? <p style={{ color:'var(--gray-500)', fontSize:13 }}>Cargando...</p>
                          : items.map((item, i) => (
                            <div key={i} className="mispedidos__item">
                              <div className="mispedidos__item-info">
                                <span className="mispedidos__item-name">
                                  {item.product_name || item.sku || `Producto #${item.product_id}`}
                                </span>
                                {item.sku && item.product_name && (
                                  <span style={{ fontSize:11, color:'var(--gray-500)', marginLeft:4 }}>({item.sku})</span>
                                )}
                                <span className="mispedidos__item-qty">× {item.quantity}</span>
                              </div>
                              <span className="mispedidos__item-price">{fmt(item.price * item.quantity)}</span>
                            </div>
                          ))
                        }
                      </div>

                      {/* Envío e info */}
                      <div className="mispedidos__grid">
                        <div><strong>Método de pago:</strong> {o.payment_method || '—'}</div>
                        <div><strong>Costo envío:</strong> {fmt(o.shipping_cost || 0)}</div>
                        <div><strong>Mensajería:</strong> {o.shipping_company || '—'}</div>
                        <div><strong>Ciudad:</strong> {o.city || '—'}</div>
                        {o.shipping_address && <div style={{ gridColumn:'1/-1' }}><strong>Dirección:</strong> {o.shipping_address}</div>}
                      </div>

                      {/* Detalles del pago si ya está pagado */}
                      {o.order_status === 'pagado' && o.cs_transaction_id && (
                        <div className="mispedidos__payment-info">
                          <h4 className="mispedidos__section-title">✅ Información del pago</h4>
                          <div className="mispedidos__grid">
                            {o.cs_transaction_id    && <div><strong>ID Transacción:</strong> {o.cs_transaction_id}</div>}
                            {o.cs_approval_code     && <div><strong>Código aprobación:</strong> {o.cs_approval_code}</div>}
                            {o.cs_reconciliation_id && <div><strong>Reconciliación:</strong> {o.cs_reconciliation_id}</div>}
                            {o.cs_status            && <div><strong>Estado CyberSource:</strong> {o.cs_status}</div>}
                            {o.paid_at              && <div><strong>Fecha de pago:</strong> {new Date(o.paid_at).toLocaleString('es-CO')}</div>}
                            {o.cs_simulated == 1    && <div style={{ color:'var(--gray-500)' }}><em>Pago simulado (modo prueba)</em></div>}
                          </div>
                        </div>
                      )}

                      {/* Botón pagar si está pendiente */}
                      {canPay(o) && (
                        <div className="mispedidos__pay">
                          <p className="mispedidos__pay-text">
                            Esta orden está pendiente de pago.
                          </p>
                          <button
                            className="mispedidos__pay-btn"
                            onClick={() => navigate(`/pagar/${o.id}`)}
                          >
                            💳 Pagar ahora
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
