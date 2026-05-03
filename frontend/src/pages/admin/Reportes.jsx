// src/pages/admin/Reportes.jsx
import { useState, useEffect } from 'react'
import { ordersService, productsService, customersService } from '../../services/api'
import MainLayout from '../../layouts/MainLayout'
import { Spinner, fmt } from '../../components'

export default function Reportes() {
  const [orders,    setOrders]    = useState([])
  const [products,  setProducts]  = useState([])
  const [customers,    setCustomers]    = useState([])
  const [stockAlerts,  setStockAlerts]  = useState({ low_stock: [], failed_attempts: [] })
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ac_token')
    Promise.all([
      ordersService.getAll().catch(() => []),
      productsService.getAll({ source: 'local', limit: 100 }).catch(() => ({ products: [] })),
      customersService.getAll().catch(() => []),
      fetch('/api/products/stock-alerts', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => (d.low_stock ? d : { low_stock: [], failed_attempts: [] }))
        .catch(() => ({ low_stock: [], failed_attempts: [] })),
    ])
      .then(([ords, prods, custs, alerts]) => {
        setOrders(ords)
        setProducts(prods.products || [])
        setCustomers(custs)
        setStockAlerts(alerts || { low_stock: [], failed_attempts: [] })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <MainLayout showFilter={false}><Spinner /></MainLayout>

  const totalRevenue  = orders.filter(o => o.order_status !== 'cancelado').reduce((s, o) => s + o.amount, 0)
  const totalOrders   = orders.length
  const pendientes    = orders.filter(o => o.order_status === 'pendiente').length
  const entregadas    = orders.filter(o => o.order_status === 'entregado').length
  const canceladas    = orders.filter(o => o.order_status === 'cancelado').length
  const totalProducts = products.length
  const totalCustomers = customers.length
  const avgOrder      = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Ventas por método de pago
  const byPayment = orders.reduce((acc, o) => {
    acc[o.payment_method] = (acc[o.payment_method] || 0) + 1
    return acc
  }, {})

  // Ventas por estado
  const byStatus = orders.reduce((acc, o) => {
    acc[o.order_status] = (acc[o.order_status] || 0) + 1
    return acc
  }, {})

  const Metric = ({ label, value, sub, color = 'var(--brown)' }) => (
    <div className="card" style={{ padding: '20px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 8, letterSpacing: '.5px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>{sub}</div>}
    </div>
  )

  const Bar = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{label}</span>
          <span style={{ color: 'var(--gray-500)' }}>{count} ({pct}%)</span>
        </div>
        <div style={{ height: 8, background: 'var(--cream-dark)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .5s' }} />
        </div>
      </div>
    )
  }

  return (
    <MainLayout showFilter={false}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Reportes</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Metric label="Ingresos totales"  value={fmt(totalRevenue)}   color="var(--green)" />
        <Metric label="Total órdenes"     value={totalOrders}          sub={`${pendientes} pendientes`} />
        <Metric label="Ticket promedio"   value={fmt(Math.round(avgOrder))} color="var(--gold)" />
        <Metric label="Entregadas"        value={entregadas}           color="var(--green)" sub={`${canceladas} canceladas`} />
        <Metric label="Productos"         value={totalProducts} />
        <Metric label="Clientes"          value={totalCustomers} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Por estado */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Órdenes por estado</h3>
          {Object.entries(byStatus).length === 0
            ? <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Sin datos aún</p>
            : Object.entries(byStatus).map(([status, count]) => (
              <Bar key={status} label={status} count={count} total={totalOrders}
                color={status === 'entregado' ? 'var(--green)' : status === 'cancelado' ? 'var(--red)' : 'var(--gold)'} />
            ))
          }
        </div>

        {/* Por método de pago */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Ventas por método de pago</h3>
          {Object.entries(byPayment).length === 0
            ? <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Sin datos aún</p>
            : Object.entries(byPayment).map(([method, count]) => (
              <Bar key={method} label={method} count={count} total={totalOrders} color="var(--gold)" />
            ))
          }
        </div>
      </div>

      {/* Últimas órdenes */}
      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--cream-dark)', fontSize: 15 }}>
          Últimas órdenes
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--cream-dark)' }}>
              {['# Orden', 'Cliente', 'Fecha', 'Método pago', 'Total', 'Estado'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--gray-500)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--cream-dark)' }}>
                <td style={{ padding: '10px 16px', fontWeight: 700 }}>#{o.id}</td>
                <td style={{ padding: '10px 16px' }}>{o.customer_name || o.customer_email || '—'}</td>
                <td style={{ padding: '10px 16px', color: 'var(--gray-500)' }}>
                  {new Date(o.order_date).toLocaleDateString('es-CO')}
                </td>
                <td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>{o.payment_method}</td>
                <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--green)' }}>{fmt(o.amount)}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: o.order_status === 'entregado' ? '#f0fdf4' : o.order_status === 'cancelado' ? '#fef2f2' : '#fff8e6',
                    color: o.order_status === 'entregado' ? '#15803d' : o.order_status === 'cancelado' ? '#b91c1c' : '#a16207',
                  }}>{o.order_status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="empty-state"><h3>No hay órdenes aún</h3></div>}
      </div>
      {/* ── Stock alerts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginTop:28 }}>
        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontWeight:700, marginBottom:14, color:'var(--red)', fontSize:15 }}>
            ⚠️ Productos con stock bajo (≤5)
          </h3>
          {stockAlerts.low_stock.length === 0
            ? <p style={{ fontSize:13, color:'var(--gray-500)' }}>Todos los productos tienen stock suficiente ✓</p>
            : <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--cream)' }}>
                    {['SKU','Nombre','Stock'].map(h=><th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:700, fontSize:11 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {stockAlerts.low_stock.map(p => (
                    <tr key={p.id} style={{ borderBottom:'1px solid var(--cream-dark)' }}>
                      <td style={{ padding:'8px 10px', color:'var(--gray-500)' }}>{p.sku}</td>
                      <td style={{ padding:'8px 10px', fontWeight:600 }}>{p.name}</td>
                      <td style={{ padding:'8px 10px', fontWeight:700, color: p.stock === 0 ? 'var(--red)' : '#f59e0b' }}>
                        {p.stock === 0 ? 'AGOTADO' : p.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        <div className="card" style={{ padding:20 }}>
          <h3 style={{ fontWeight:700, marginBottom:14, color:'#a16207', fontSize:15 }}>
            📋 Intentos fallidos por stock
          </h3>
          {stockAlerts.failed_attempts.length === 0
            ? <p style={{ fontSize:13, color:'var(--gray-500)' }}>Sin intentos de compra fallidos ✓</p>
            : <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--cream)' }}>
                    {['Producto','Intentos','Pedido'].map(h=><th key={h} style={{ padding:'8px 10px', textAlign:'left', fontWeight:700, fontSize:11 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {stockAlerts.failed_attempts.map((f,i) => (
                    <tr key={i} style={{ borderBottom:'1px solid var(--cream-dark)' }}>
                      <td style={{ padding:'8px 10px', fontWeight:600 }}>{f.product_name}</td>
                      <td style={{ padding:'8px 10px', fontWeight:700, color:'var(--red)' }}>{f.attempt_count}</td>
                      <td style={{ padding:'8px 10px', color:'var(--gray-500)' }}>{f.total_requested} unid.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </MainLayout>
  )
}
