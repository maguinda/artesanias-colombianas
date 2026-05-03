// src/pages/customer/PagarOrden.jsx
// Página de pago para una orden pendiente
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout   from '../../layouts/MainLayout'
import Spinner      from '../../components/Spinner/Spinner'
import { useToast } from '../../components/Toast/Toast'
import { ordersService, paymentService } from '../../services/api'
import { fmt } from '../../components'
import './PagarOrden.css'

export default function PagarOrden() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const toast    = useToast()

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying,   setPaying]   = useState(false)
  const [payError, setPayError] = useState(null)  // { message, cs_status, cs_reason }
  const [method,   setMethod]   = useState('efectivo')

  // Tarjeta
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expMonth,   setExpMonth]   = useState('')
  const [expYear,    setExpYear]    = useState('')
  const [cvv,        setCvv]        = useState('')
  const [cardType,   setCardType]   = useState('VISA')

  // Efectivo
  const [phone, setPhone] = useState('')

  useEffect(() => {
    ordersService.getOne(id)
      .then(setOrder)
      .catch(() => navigate('/mis-pedidos'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePay = async () => {
    if (!order) return
    setPaying(true)
    try {
      const body = {
        method,
        amount:           order.amount,
        order_id:         order.id,
        // Datos del cliente desde la orden
        customer_name:    order.nombre_cliente || order.customer_name || cardHolder || '',
        customer_email:   order.order_email || order.customer_email || '',
        customer_phone:   order.celular_cliente || order.customer_phone || phone || '',
        shipping_address: order.shipping_address || '',
        barrio:           order.barrio || '',
        city:             order.city || '',
        // Ítems de la orden para referencia
        items:            order.items || [],
      }

      if (method === 'tarjeta') {
        if (!cardNumber || !cardHolder || !expMonth || !expYear || !cvv) {
          toast('Completa todos los datos de la tarjeta', 'error')
          setPaying(false); return
        }
        body.card = { number: cardNumber.replace(/\s/g,''), holder: cardHolder, expiry_month: expMonth, expiry_year: expYear, cvv, type: cardType }
      } else {
        if (!phone) { toast('Ingresa tu número de celular', 'error'); setPaying(false); return }
        body.phone_number = phone
      }

      const payResult = await paymentService.process(body)

      // Guardar detalles del pago en la BD + marcar como pagado
      await ordersService.savePayment(id, {
        cs_transaction_id:    payResult.transaction_id || null,
        cs_approval_code:     payResult.processorInformation?.approvalCode || null,
        cs_reconciliation_id: payResult.reconciliationId || null,
        cs_reference_code:    payResult.clientReferenceInformation?.code || null,
        cs_response_code:     payResult.processorInformation?.responseCode || null,
        cs_network_tx_id:     payResult.processorInformation?.networkTransactionId || null,
        cs_status:            payResult.cs_status || payResult.status || null,
        cs_submit_time:       payResult.submitTimeUtc || new Date().toISOString(),
        cs_simulated:         payResult.simulated ? 1 : 0,
      })

      toast('¡Pago exitoso! 🎉', 'success')
      navigate('/mis-pedidos')
    } catch (err) {
      // Construir mensaje de error claro según el tipo de rechazo
      const reason = err.cs_reason || ''
      // El backend ya mapea el reason code a mensaje amigable en español
      // err.message viene directo del backend con el mensaje traducido
      const friendlyMsg = err.message || 'No se pudo procesar el pago.'
      setPayError({ message: friendlyMsg, cs_status: err.cs_status, cs_reason: reason })
      toast(friendlyMsg, 'error')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <MainLayout><Spinner /></MainLayout>
  if (!order)  return null

  return (
    <MainLayout>
      <div className="pagar">
        <div className="pagar__card">
          <h2 className="pagar__title">Pagar orden #{order.id}</h2>

          {/* Resumen */}
          <div className="pagar__summary">
            <div className="pagar__summary-row">
              <span>Subtotal productos</span>
              <span>{fmt(order.amount - (order.shipping_cost || 0))}</span>
            </div>
            <div className="pagar__summary-row">
              <span>Costo de envío</span>
              <span>{fmt(order.shipping_cost || 0)}</span>
            </div>
            <div className="pagar__summary-row pagar__summary-row--total">
              <span>Total a pagar</span>
              <span>{fmt(order.amount)}</span>
            </div>
          </div>

          {/* Método */}
          <div className="pagar__methods">
            <h3 className="pagar__section-title">Método de pago</h3>
            <div className="pagar__method-btns">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: '💵' },
                { id: 'tarjeta',  label: 'Tarjeta',  icon: '💳' },
              ].map(m => (
                <button key={m.id}
                  className={`pagar__method-btn ${method === m.id ? 'pagar__method-btn--active' : ''}`}
                  onClick={() => setMethod(m.id)}>
                  <span className="pagar__method-icon">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario según método */}
          {method === 'tarjeta' ? (
            <div className="pagar__form">
              <div className="pagar__form-row">
                <label className="pagar__label">Tipo de tarjeta</label>
                <select className="pagar__input" value={cardType} onChange={e => setCardType(e.target.value)}>
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">American Express</option>
                </select>
              </div>
              <div className="pagar__form-row">
                <label className="pagar__label">Número de tarjeta</label>
                <input className="pagar__input" type="text" maxLength={19} placeholder="0000 0000 0000 0000"
                  value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/(\d{4})(?=\d)/g,'$1 ').trim())} />
              </div>
              <div className="pagar__form-row">
                <label className="pagar__label">Titular</label>
                <input className="pagar__input" type="text" placeholder="Nombre como aparece en la tarjeta"
                  value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} />
              </div>
              <div className="pagar__form-2col">
                <div className="pagar__form-row">
                  <label className="pagar__label">Mes de vencimiento</label>
                  <input className="pagar__input" type="text" maxLength={2} placeholder="MM"
                    value={expMonth} onChange={e => setExpMonth(e.target.value)} />
                </div>
                <div className="pagar__form-row">
                  <label className="pagar__label">Año de vencimiento</label>
                  <input className="pagar__input" type="text" maxLength={4} placeholder="AAAA"
                    value={expYear} onChange={e => setExpYear(e.target.value)} />
                </div>
              </div>
              <div className="pagar__form-row">
                <label className="pagar__label">CVV</label>
                <input className="pagar__input pagar__input--sm" type="password" maxLength={4} placeholder="***"
                  value={cvv} onChange={e => setCvv(e.target.value)} />
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#15803d', border: '1px solid #86efac' }}>
                <strong>Tarjetas de prueba:</strong><br/>
                VISA: 4111 1111 1111 1111 · CVV: 123 · Exp: 12/2031<br/>
                Mastercard: 5555 5555 5555 4444 · CVV: 123 · Exp: 12/2031
              </div>
            </div>
          ) : (
            <div className="pagar__form">
              <div className="pagar__form-row">
                <label className="pagar__label">Número de celular</label>
                <input className="pagar__input" type="tel" placeholder="3XXXXXXXXX"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
                Se procesará el pago en efectivo contra entrega.
              </p>
            </div>
          )}

          {/* Panel de error de pago */}
          {payError && (
            <div className="pagar__error">
              <div className="pagar__error-icon">❌</div>
              <div>
                <p className="pagar__error-title">Pago rechazado</p>
                <p className="pagar__error-msg">{payError.message}</p>
                {payError.cs_reason && (
                  <p className="pagar__error-code">Código: {payError.cs_reason}</p>
                )}
                <p className="pagar__error-hint">
                  Verifica los datos de tu tarjeta o intenta con otro método de pago.
                </p>
              </div>
            </div>
          )}

          <button className="pagar__btn" onClick={() => { setPayError(null); handlePay() }} disabled={paying}>
            {paying ? 'Procesando...' : `Pagar ${fmt(order.amount)}`}
          </button>

          <button className="pagar__cancel" onClick={() => navigate('/mis-pedidos')}>
            Cancelar
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
