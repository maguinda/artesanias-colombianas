// src/pages/Perfil.jsx
import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import {} from '../components'
import { useToast } from '../components/Toast/Toast'

export default function Perfil() {
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    full_name: user?.name || '', phone: user?.phone || '',
    cedula: user?.cedula || '', city: user?.city || '',
    billing_address: user?.billing_address || '' })
  const [saving, setSaving] = useState(false)
  const setF = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const handleSave = async () => {
    setSaving(true)
    try {
      await authService.updateMe(form)
      toast('Perfil actualizado ✓','success')
    } catch(e) { toast(e.message,'error') }
    finally { setSaving(false) }
  }

  return (
    <>
      <h2 className="section-title">Mi perfil</h2>
      <div className="card" style={{ maxWidth:500, padding:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, fontWeight:700 }}>
            {user?.name?.[0]?.toUpperCase()||'U'}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:18 }}>{user?.name}</div>
            <div style={{ color:'var(--gray-500)', fontSize:13 }}>{user?.email}</div>
            <span className={`badge ${user?.role==='admin'?'badge-gold':'badge-gray'}`} style={{ marginTop:4, display:'inline-block' }}>{user?.role}</span>
          </div>
        </div>
        {[['full_name','Nombre completo'],['phone','Teléfono'],['cedula','Cédula'],['city','Ciudad'],['billing_address','Dirección de facturación']].map(([k,label])=>(
          <div className="form-group" key={k}>
            <label className="form-label">{label}</label>
            <input className="form-input" value={form[k]} onChange={setF(k)} />
          </div>
        ))}
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
      </div>
    </>
  )
}
