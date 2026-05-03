import logoVertical from '../assets/images/logo_nombre_vertical.png'
// src/pages/Recuperar.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Recuperar() {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)

  const handleSubmit = e => { e.preventDefault(); setSent(true) }

  return (
    <div style={{ minHeight:'100vh', background:'#f0ece4', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:32 }}>
      <div style={{ display:'flex', background:'#fff', borderRadius:18, boxShadow:'0 8px 40px rgba(61,31,0,.13)', overflow:'hidden', maxWidth:760, width:'95%' }}>
        <div style={{ flex:'0 0 220px', background:'#f8f4ee', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, borderRight:'1px solid #ede8e0' }}>
          <div style={{ fontSize:70 }}>🎨</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, color:'var(--brown)', marginTop:16, textAlign:'center', lineHeight:1.2 }}>ARTESANÍAS<br />COLOMBIANAS</div>
        </div>
        <div style={{ flex:1, padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
          {sent ? (
            <>
              <h2 style={{ fontFamily:'var(--font-display)', marginBottom:12 }}>¡Código enviado!</h2>
              <p style={{ color:'var(--gray-700)', marginBottom:20 }}>Revisa tu correo <strong>{email}</strong> para el código de verificación.</p>
              <Link to="/verificar" className="btn btn-primary" style={{ display:'inline-flex' }}>Verificar código</Link>
            </>
          ) : (
            <>
              <p style={{ color:'var(--gray-700)', marginBottom:28, textAlign:'center', lineHeight:1.6 }}>
                Escribe el correo a la cuenta asociada, te<br />enviaremos un código de verificación
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <span style={{ fontSize:22 }}>✉️</span>
                  <input className="form-input" style={{ flex:1 }} type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
                </div>
                <button className="btn btn-primary btn-full" type="submit" style={{ borderRadius:8, padding:13 }}>Enviar código</button>
              </form>
              <div style={{ textAlign:'center', marginTop:14, fontSize:13 }}>
                <span style={{ color:'var(--gray-500)' }}>¿Ya tienes una cuenta? </span>
                <Link to="/login" style={{ color:'var(--gold)', fontWeight:700 }}>Inicia sesión aquí</Link>
              </div>
            </>
          )}
        </div>
      </div>
      <button style={{ padding:'12px 28px', border:'1.5px solid var(--gray-100)', borderRadius:8, background:'#fff', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontWeight:600, fontSize:14, boxShadow:'var(--shadow)' }}>
        <span style={{ fontSize:18 }}>G</span> Inicia sesión con Google
      </button>
      <p style={{ fontSize:13, color:'var(--gray-500)' }}>
        ¿Aún no tienes una cuenta? <Link to="/registro" style={{ color:'var(--gold)', fontWeight:700 }}>Regístrate aquí</Link>
      </p>
    </div>
  )
}
