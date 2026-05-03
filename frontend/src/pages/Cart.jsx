// src/pages/Cart.jsx
import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ordersService } from '../services/api'
import { QtyControl, Stars, ProductCard, fmt } from '../components'
import { useToast } from '../components/Toast/Toast'

const STEPS = ['Carrito de compras','Datos cliente','Envío','Método de pago','Resumen']
const PAYMENT_METHODS = [
  { id:'efectivo',    label:'Efectivo',       icon:'💵' },
  { id:'nequi',       label:'Nequi',          icon:'🅽' },
  { id:'bancolombia', label:'Bancolombia',    icon:'🏦' },
  { id:'daviplata',   label:'Daviplata',      icon:'💳' },
  { id:'dale',        label:'Dale',           icon:'🔵' },
  { id:'tarjeta',     label:'Tarjeta crédito',icon:'💳' },
]
const SHIPPING_COMPANIES = [
  { id:'barbachos',       label:'Barbachos',       icon:'🛵', cost:8000 },
  { id:'interrapidisimo', label:'Interrapidísimo', icon:'⚡', cost:12000 },
  { id:'coordinadora',    label:'Coordinadora',    icon:'🔵', cost:10000 },
  { id:'punto_fisico',    label:'Punto físico',    icon:'🏪', cost:0 },
  { id:'uber',            label:'Uber mensajería', icon:'⬛', cost:15000 },
]

export default function Cart() {
  const { items, total, updateQty, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [cliente, setCliente] = useState({ nombre:'',cedula:'',celular:'',direccion:'',barrio:'',ciudad:'',detalles:'' })
  const [shipping, setShipping] = useState({ company:'barbachos', method:'contra_entrega', abono:0, cost:8000 })
  const [payMethod, setPayMethod] = useState('efectivo')
  const [loading, setLoading] = useState(false)

  const setC = k => e => setCliente(f=>({...f,[k]:e.target.value}))

  /* ── Breadcrumb ── */
  const Breadcrumb = () => (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:24, flexWrap:'wrap' }}>
      {STEPS.map((s,i) => (
        <span key={i}>
          <span className={`step ${step===i?'active':''}`} onClick={()=>i<step&&setStep(i)}>{s}</span>
          {i<STEPS.length-1&&<span className="step-sep"> &gt;&gt; </span>}
        </span>
      ))}
      {step>0 && <button className="btn btn-outline btn-sm" style={{marginLeft:'auto'}} onClick={()=>setStep(s=>s-1)}>‹ VOLVER</button>}
    </div>
  )

  /* ── Step 0: Cart ── */
  const CartStep = () => (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:32, alignItems:'start' }}>
      <div className="card" style={{ padding:20 }}>
        {items.length===0
          ? <div className="empty-state"><h3>Tu carrito está vacío</h3><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>navigate('/')}>Ver productos</button></div>
          : items.map(item=>(
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom:'1px solid var(--cream-dark)' }}>
              <input type="checkbox" defaultChecked style={{flexShrink:0}} />
              <img src={item.product_image||'https://placehold.co/80x80/f0e6d2/7a4a1e?text=🎨'} style={{ width:80,height:80,objectFit:'cover',borderRadius:8 }} />
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>{item.product_name}</div>
                <div style={{color:'var(--green)',fontWeight:700,marginTop:4}}>{fmt(item.price)} COP</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
                <button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18}}>🗑</button>
                <button style={{background:'none',border:'none',cursor:'pointer',fontSize:18}}>✏️</button>
                <QtyControl value={item.quantity} onChange={qty=>updateQty(item.id,qty)} />
              </div>
            </div>
          ))
        }
      </div>

      <div>
        <div className="card" style={{padding:20,marginBottom:16}}>
          <h3 style={{fontWeight:700,marginBottom:16}}>Forma de pago</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {PAYMENT_METHODS.map(m=>(
              <label key={m.id} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                <input type="radio" name="pay" value={m.id} checked={payMethod===m.id} onChange={()=>setPayMethod(m.id)} />
                <span>{m.icon}</span><span>{m.label}</span>
              </label>
            ))}
          </div>
          <div className="divider" />
          <h3 style={{fontWeight:700,marginBottom:12}}>Datos del cliente</h3>
          {['nombre','cedula','celular','direccion','barrio','ciudad','detalles'].map(k=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <label style={{width:80,fontSize:12,fontWeight:600,textTransform:'uppercase',color:'var(--gray-500)',flexShrink:0}}>{k}:</label>
              <input className="form-input" style={{flex:1,padding:'6px 10px',fontSize:13}} value={cliente[k]} onChange={setC(k)} />
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontWeight:600}}>Total a cobrar:</span>
          <span style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:700,color:'var(--brown)'}}>{fmt(total)}</span>
        </div>
        <button className="btn btn-primary btn-full" onClick={()=>setStep(1)} disabled={items.length===0} style={{borderRadius:8,padding:14}}>
          Realizar compra
        </button>
      </div>
    </div>
  )

  /* ── Step 1: Datos cliente ── */
  const DatosStep = () => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:32,alignItems:'start'}}>
      <div className="card" style={{padding:28}}>
        <h2 style={{marginBottom:24,fontFamily:'var(--font-display)'}}>Datos del cliente</h2>
        {[['nombre','NOMBRE'],['cedula','CÉDULA'],['celular','CELULAR'],['direccion','DIRECCIÓN'],['barrio','BARRIO'],['ciudad','CIUDAD'],['detalles','DETALLES']].map(([k,label])=>(
          <div key={k} style={{display:'flex',alignItems:'center',gap:16,marginBottom:14}}>
            <label style={{width:90,fontSize:12,fontWeight:700,color:'var(--gray-500)',flexShrink:0}}>{label}:</label>
            <input className="form-input" style={{flex:1}} value={cliente[k]} onChange={setC(k)} />
          </div>
        ))}
        <button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setStep(2)}>GUARDAR DATOS</button>
      </div>
      <CartSummary onNext={()=>setStep(2)} nextLabel="IR A MÉTODO DE PAGO" />
    </div>
  )

  /* ── Step 2: Envío ── */
  const EnvioStep = () => {
    const sel = SHIPPING_COMPANIES.find(c=>c.id===shipping.company)||SHIPPING_COMPANIES[0]
    return (
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:32,alignItems:'start'}}>
        <div className="card" style={{padding:28}}>
          <h2 style={{marginBottom:20,fontFamily:'var(--font-display)'}}>Envío</h2>
          <p style={{fontSize:13,color:'var(--gray-500)',marginBottom:20}}>Seleccione la empresa de mensajería.</p>
          {SHIPPING_COMPANIES.map(c=>(
            <label key={c.id} style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,cursor:'pointer'}}>
              <input type="radio" checked={shipping.company===c.id} onChange={()=>setShipping(s=>({...s,company:c.id,cost:c.cost}))} />
              <span style={{fontSize:22}}>{c.icon}</span>
              <span style={{fontWeight:600}}>{c.label}</span>
            </label>
          ))}
        </div>
        <div>
          <CartSummary onNext={()=>setStep(3)} nextLabel="IR A MÉTODO DE PAGO" />
          <div className="card" style={{padding:20,marginTop:16}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--gray-500)',marginBottom:8}}>Subtotal</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:700}}>{fmt(total)}</div>
              <div style={{fontSize:12,color:'var(--gray-500)',marginTop:4}}>El valor del envío varía con el destino y el valor total.</div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>1. Agregue el abono parcial:</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:13,fontWeight:600}}>Abono parcial</span>
                <span style={{color:'var(--gray-500)'}}>$</span>
                <input className="form-input" style={{width:80,padding:'6px 8px',textAlign:'right'}} type="number" value={shipping.abono} onChange={e=>setShipping(s=>({...s,abono:+e.target.value}))} />
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>2. Seleccione el método de envío:</div>
              {['contra_entrega','solo_envio'].map(m=>(
                <label key={m} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,cursor:'pointer',fontSize:13}}>
                  <input type="radio" checked={shipping.method===m} onChange={()=>setShipping(s=>({...s,method:m}))} />
                  {m==='contra_entrega'?'Contra entrega':'Solo envío'}
                </label>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>3. Ingrese el valor del envío:</div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:13,fontWeight:600}}>Valor envío</span>
                <span style={{color:'var(--gray-500)'}}>$</span>
                <input className="form-input" style={{width:90,padding:'6px 8px',textAlign:'right'}} type="number" value={shipping.cost} onChange={e=>setShipping(s=>({...s,cost:+e.target.value}))} />
              </div>
            </div>
            <div className="divider" />
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <span style={{fontSize:13,fontWeight:600}}>Total a cobrar:</span>
              <span style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700}}>{fmt(total+shipping.cost)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Step 3: Método de pago ── */
  const PagoStep = () => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:32,alignItems:'start'}}>
      <div className="card" style={{padding:28}}>
        <h2 style={{marginBottom:8,fontFamily:'var(--font-display)'}}>Método de pago</h2>
        <p style={{color:'var(--gray-500)',fontSize:13,marginBottom:24}}>Seleccione el método de pago.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}}>
          {PAYMENT_METHODS.map(m=>(
            <label key={m.id} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontSize:14,fontWeight:600}}>
              <input type="radio" name="pay2" checked={payMethod===m.id} onChange={()=>setPayMethod(m.id)} />
              <span style={{fontSize:28}}>{m.icon}</span>
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button className="btn btn-primary" style={{padding:'14px 32px'}} onClick={()=>setStep(4)}>Ir a resumen</button>
      </div>
    </div>
  )

  /* ── Step 4: Resumen ── */
  const ResumenStep = () => {
    const selectedCompany = SHIPPING_COMPANIES.find(c=>c.id===shipping.company)
    const grandTotal = total + shipping.cost

    const handleCreateOrder = async () => {
      setLoading(true)
      try {
        await ordersService.create({
          items: items.map(i=>({ product_id:i.product_id, quantity:i.quantity, price:i.price, sku:i.sku })),
          shipping_address: cliente.direccion,
          barrio: cliente.barrio,
          city: cliente.ciudad,
          order_email: '',
          payment_method: payMethod,
          shipping_cost: shipping.cost,
          shipping_company: selectedCompany?.label,
          notes: cliente.detalles })
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
      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:32,alignItems:'start'}}>
        <div className="card" style={{padding:24}}>
          <h2 style={{fontFamily:'var(--font-display)',marginBottom:20}}>RESUMEN</h2>
          <h3 style={{marginBottom:14,fontSize:14,color:'var(--gray-500)'}}>Carrito de compras</h3>
          {items.map(item=>(
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid var(--cream-dark)'}}>
              <input type="checkbox" defaultChecked />
              <img src={item.product_image||'https://placehold.co/70x70/f0e6d2/7a4a1e?text=🎨'} style={{width:70,height:70,objectFit:'cover',borderRadius:8}} />
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{item.product_name}</div>
                <div style={{color:'var(--green)',fontWeight:700,marginTop:4}}>{fmt(item.price)} COP</div>
              </div>
              <QtyControl value={item.quantity} onChange={qty=>updateQty(item.id,qty)} />
            </div>
          ))}
        </div>
        <div className="card" style={{padding:24}}>
          <h3 style={{fontWeight:700,marginBottom:16}}>Método de pago</h3>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
            <span style={{fontSize:28}}>{PAYMENT_METHODS.find(m=>m.id===payMethod)?.icon}</span>
            <span style={{fontWeight:700}}>{PAYMENT_METHODS.find(m=>m.id===payMethod)?.label}</span>
          </div>
          <div className="divider" />
          <h3 style={{fontWeight:700,marginBottom:12}}>Datos cliente</h3>
          {[['NOMBRE',cliente.nombre],['CÉDULA',cliente.cedula],['CELULAR',cliente.celular],['DIRECCIÓN',cliente.direccion],['BARRIO',cliente.barrio],['CIUDAD',cliente.ciudad],['DETALLES',cliente.detalles]].map(([l,v])=>v&&(
            <div key={l} style={{display:'flex',gap:12,marginBottom:6,fontSize:13}}>
              <span style={{fontWeight:700,width:80,flexShrink:0}}>{l}:</span>
              <span style={{color:'var(--gray-700)'}}>{v}</span>
            </div>
          ))}
          <div className="divider" />
          <h3 style={{fontWeight:700,marginBottom:12}}>ENVÍO</h3>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:22}}>{selectedCompany?.icon}</span>
              <span style={{fontWeight:600}}>{selectedCompany?.label}</span>
            </div>
            <span>Valor envío {fmt(shipping.cost)}</span>
          </div>
          <div className="divider" />
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:20}}>
            <span style={{fontWeight:600}}>Total a cobrar:</span>
            <span style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:700}}>{fmt(grandTotal)}</span>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleCreateOrder} disabled={loading} style={{padding:14,fontSize:15}}>
            {loading ? 'Creando orden...' : 'crear venta'}
          </button>
        </div>
      </div>
    )
  }

  /* ── Cart sidebar summary ── */
  const CartSummary = ({ onNext, nextLabel }) => (
    <div className="card" style={{padding:20}}>
      <h3 style={{fontWeight:700,marginBottom:14}}>Carrito de compras</h3>
      {items.map(item=>(
        <div key={item.id} style={{display:'flex',gap:10,marginBottom:12,alignItems:'center'}}>
          <input type="checkbox" defaultChecked />
          <img src={item.product_image||'https://placehold.co/60x60/f0e6d2/7a4a1e?text=🎨'} style={{width:60,height:60,objectFit:'cover',borderRadius:6}} />
          <div style={{flex:1,fontSize:13}}>
            <div style={{fontWeight:600}}>{item.product_name}</div>
            <div style={{color:'var(--green)',fontWeight:700}}>{fmt(item.price)} COP</div>
          </div>
          <QtyControl value={item.quantity} onChange={qty=>updateQty(item.id,qty)} />
        </div>
      ))}
      <div className="divider" />
      <div style={{marginBottom:8,fontSize:13,color:'var(--gray-500)'}}>Subtotal <strong style={{color:'var(--brown)',fontSize:18}}>{fmt(total)}</strong></div>
      <div style={{fontSize:12,color:'var(--gray-500)',marginBottom:16}}>El valor del envío varía con el destino.</div>
      <button className="btn btn-primary btn-full" onClick={onNext} style={{padding:12}}>{nextLabel}</button>
    </div>
  )

  return (
    <>
      <Breadcrumb />
      {step===0 && <CartStep />}
      {step===1 && <DatosStep />}
      {step===2 && <EnvioStep />}
      {step===3 && <PagoStep />}
      {step===4 && <ResumenStep />}
    </>
  )
}
