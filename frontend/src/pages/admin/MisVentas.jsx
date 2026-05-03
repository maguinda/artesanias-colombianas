// src/pages/admin/MisVentas.jsx
import { useState, useEffect } from 'react'
import { ordersService } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import { Spinner, fmt } from '../../components'
import { useToast } from '../../components/Toast/Toast'
import './Admin.css'

const STATUS_COLORS = {
  pendiente: { bg: '#fff8e6', color: '#a16207', label: 'Pendiente' },
  pagado:    { bg: '#f0fdf4', color: '#15803d', label: 'Pagado'    },
  enviado:   { bg: '#eff6ff', color: '#1d4ed8', label: 'Enviado'   },
  entregado: { bg: '#f0fdf4', color: '#15803d', label: 'Entregado' },
  cancelado: { bg: '#fef2f2', color: '#b91c1c', label: 'Cancelado' },
}
const VALID_STATUSES = ['pendiente','pagado','enviado','entregado','cancelado']
const PAGE_SIZE = 10

export default function MisVentas() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('todos')
  const [search,  setSearch]  = useState('')
  const [detail,  setDetail]  = useState(null)
  const [items,   setItems]   = useState({})
  const [page,    setPage]    = useState(1)
  const toast = useToast()

  const load = () => {
    ordersService.getAll()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const updateStatus = async (id, status) => {
    try {
      await ordersService.updateStatus(id, status)
      toast(`Estado → "${status}"`, 'success')
      load()
    } catch (e) { toast(e.message, 'error') }
  }

  const toggleDetail = async (o) => {
    const next = detail?.id === o.id ? null : o
    setDetail(next)
    if (next && !items[o.id]) {
      try {
        const its = await ordersService.getItems(o.id)
        setItems(prev => ({ ...prev, [o.id]: its }))
      } catch { setItems(prev => ({ ...prev, [o.id]: [] })) }
    }
  }

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'todos' || o.order_status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || [
      o.id?.toString(), o.customer_name, o.nombre_cliente,
      o.customer_email, o.order_email, o.customer_phone,
      o.celular_cliente, o.city, o.shipping_address, o.shipping_company,
    ].some(v => v?.toLowerCase().includes(q))
    return matchFilter && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const handleFilter = (f) => { setFilter(f); setPage(1); setDetail(null) }
  const handleSearch = (v)  => { setSearch(v); setPage(1); setDetail(null) }

  return (
    <MainLayout showFilter={false}>
      <div className="admin-page">
        <div className="admin-page__header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h2 className="admin-page__title">Mis Ventas</h2>

          {/* Buscador */}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--white)', border:'1.5px solid var(--gray-100)', borderRadius:8, padding:'6px 12px', minWidth:220 }}>
            <span style={{ color:'var(--gray-300)' }}>🔍</span>
            <input style={{ border:'none', outline:'none', fontSize:13, background:'transparent', color:'var(--brown)', width:'100%', fontFamily:'var(--font-body)' }}
              placeholder="Buscar por nombre, orden, ciudad..."
              value={search} onChange={e => handleSearch(e.target.value)} />
            {search && <button onClick={() => handleSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-500)', fontSize:16 }}>✕</button>}
          </div>

          {/* Filtros */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['todos', ...VALID_STATUSES].map(s => (
              <button key={s}
                className={`envios__filter-btn ${filter === s ? 'envios__filter-btn--active' : ''}`}
                onClick={() => handleFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['# Orden','Cliente','Ciudad','Mensajería','Pago','Total','Estado','Cambiar'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(o => {
                    const sc = STATUS_COLORS[o.order_status] || STATUS_COLORS.pendiente
                    const isOpen = detail?.id === o.id
                    const orderItems = items[o.id] || []
                    return (
                      <>
                        <tr key={o.id}
                          style={{ cursor:'pointer', background: isOpen ? '#fdf8f2' : 'transparent' }}
                          onClick={() => toggleDetail(o)}>
                          <td style={{ fontWeight:700 }}>#{o.id}</td>
                          <td>
                            <div style={{ fontWeight:600, fontSize:13 }}>{o.customer_name || o.nombre_cliente || '—'}</div>
                            <div style={{ fontSize:11, color:'var(--gray-500)' }}>{o.customer_email || o.order_email || ''}</div>
                          </td>
                          <td style={{ fontSize:13 }}>{o.city || '—'}</td>
                          <td style={{ fontSize:13 }}>{o.shipping_company || '—'}</td>
                          <td style={{ fontSize:13, textTransform:'capitalize' }}>{o.payment_method || '—'}</td>
                          <td style={{ fontWeight:700, color:'var(--green)' }}>{fmt(o.amount)}</td>
                          <td>
                            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:sc.bg, color:sc.color }}>
                              {sc.label}
                            </span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <select className="envios__status-select" value={o.order_status}
                              onChange={e => updateStatus(o.id, e.target.value)}>
                              {VALID_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>

                        {/* ── Detalle expandible ── */}
                        {isOpen && (
                          <tr key={`d-${o.id}`}>
                            <td colSpan={8} style={{ padding:0, background:'#fdf8f2' }}>
                              <div style={{ padding:'12px 20px', borderTop:'1px solid var(--cream-dark)' }}>

                                {/* Productos */}
                                {orderItems.length > 0 && (
                                  <div style={{ marginBottom:12 }}>
                                    <strong style={{ fontSize:12, textTransform:'uppercase', color:'var(--gray-700)', letterSpacing:'.4px' }}>Productos:</strong>
                                    <div style={{ marginTop:6, display:'flex', flexDirection:'column', gap:4 }}>
                                      {orderItems.map((it, i) => (
                                        <div key={i} style={{ display:'flex', gap:16, fontSize:13, alignItems:'center' }}>
                                          <span style={{ fontWeight:600 }}>{it.product_name || it.sku || `#${it.product_id}`}</span>
                                          {it.sku && it.product_name && <span style={{ color:'var(--gray-500)', fontSize:11 }}>({it.sku})</span>}
                                          <span style={{ color:'var(--gray-500)' }}>× {it.quantity}</span>
                                          <span style={{ color:'var(--green)', fontWeight:700 }}>{fmt(it.price * it.quantity)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Datos del cliente y envío */}
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:8, fontSize:12, marginBottom:10 }}>
                                  {[
                                    ['# Orden',    `#${o.id}`],
                                    ['Cliente',    o.customer_name || o.nombre_cliente || '—'],
                                    ['Email',      o.customer_email || o.order_email || '—'],
                                    ['Teléfono',   o.customer_phone || o.celular_cliente || '—'],
                                    ['Cédula',     o.cedula_cliente || '—'],
                                    ['Dirección',  o.shipping_address || '—'],
                                    ['Barrio',     o.barrio || '—'],
                                    ['Ciudad',     o.city || '—'],
                                    ['Mensajería', o.shipping_company || '—'],
                                    ['Pago',       o.payment_method || '—'],
                                    ['Costo env.', fmt(o.shipping_cost || 0)],
                                    ['Total',      fmt(o.amount)],
                                    ['Notas',      o.notes || '—'],
                                    ['Fecha',      o.order_date ? new Date(o.order_date).toLocaleString('es-CO') : '—'],
                                  ].map(([l, v]) => (
                                    <div key={l}>
                                      <span style={{ fontWeight:700, color:'var(--gray-700)' }}>{l}: </span>
                                      <span style={{ color:'var(--brown)' }}>{v}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Detalles del pago CyberSource */}
                                {o.cs_transaction_id && (
                                  <div style={{ marginTop:10, padding:'10px 12px', background:'#f0fdf4', borderRadius:8, border:'1px solid #86efac', fontSize:12 }}>
                                    <strong style={{ fontSize:12, textTransform:'uppercase', color:'#15803d', letterSpacing:'.4px' }}>✅ Información del pago:</strong>
                                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:6, marginTop:6 }}>
                                      {[
                                        ['ID Transacción',  o.cs_transaction_id],
                                        ['Aprobación',      o.cs_approval_code],
                                        ['Reconciliación',  o.cs_reconciliation_id],
                                        ['Referencia',      o.cs_reference_code],
                                        ['Estado CS',       o.cs_status],
                                        ['Fecha pago',      o.paid_at ? new Date(o.paid_at).toLocaleString('es-CO') : o.cs_submit_time],
                                      ].filter(([, v]) => v).map(([l, v]) => (
                                        <div key={l}>
                                          <span style={{ fontWeight:700, color:'#15803d' }}>{l}: </span>
                                          <span style={{ color:'#166534', fontFamily:'monospace', fontSize:11 }}>{v}</span>
                                        </div>
                                      ))}
                                      {o.cs_simulated == 1 && <div style={{ color:'var(--gray-500)' }}><em>Pago simulado (modo prueba)</em></div>}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="empty-state">
                  <h3>No hay ventas {filter !== 'todos' ? `en estado "${filter}"` : search ? `para "${search}"` : 'aún'}</h3>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="home__pagination" style={{ marginTop:20 }}>
                <button className="home__page-btn" onClick={() => setPage(p => Math.max(1, p-1))}>‹</button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} className={`home__page-btn ${page === i+1 ? 'home__page-btn--active' : ''}`}
                    onClick={() => setPage(i+1)}>{i+1}</button>
                ))}
                <button className="home__page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))}>›</button>
              </div>
            )}
            <p style={{ textAlign:'center', color:'var(--gray-500)', fontSize:12, marginTop:8 }}>
              Mostrando {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} ventas
            </p>
          </>
        )}
      </div>
    </MainLayout>
  )
}
