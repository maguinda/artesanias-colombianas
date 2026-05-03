// src/pages/MisPedidos.jsx
import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import { ordersService } from '../services/api'
import { Spinner, fmt } from '../components'

const STATUS_COLORS = { pendiente:'badge-gray', pagado:'badge-green', enviado:'badge-gold', entregado:'badge-green', cancelado:'badge-red' }

export default function MisPedidos() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)

  useEffect(()=>{
    ordersService.getAll()
      .then(setOrders)
      .catch(()=>{})
      .finally(()=>setLoading(false))
  },[])

  return (
    <>
      <h2 className="section-title">Mis pedidos</h2>
      {loading ? <Spinner /> : orders.length===0
        ? <div className="empty-state"><h3>No tienes pedidos aún</h3></div>
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {orders.map(o=>(
              <div key={o.id} className="card" style={{ padding:20, cursor:'pointer' }} onClick={()=>setOpen(open===o.id?null:o.id)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>Orden #{o.id}</div>
                    <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:2 }}>{new Date(o.order_date).toLocaleDateString('es-CO')}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span className={`badge ${STATUS_COLORS[o.order_status]||'badge-gray'}`}>{o.order_status}</span>
                    <span style={{ fontWeight:700, fontFamily:'var(--font-display)', fontSize:18 }}>{fmt(o.amount)}</span>
                  </div>
                </div>
                {open===o.id && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--cream-dark)', fontSize:13 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, color:'var(--gray-700)' }}>
                      <div><strong>Método de pago:</strong> {o.payment_method}</div>
                      <div><strong>Envío:</strong> {fmt(o.shipping_cost||0)}</div>
                      <div><strong>Dirección:</strong> {o.shipping_address}</div>
                      <div><strong>Ciudad:</strong> {o.city}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </>
  )
}
