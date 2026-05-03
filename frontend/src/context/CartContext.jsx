// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { cartService } from '../services/api'
import { useAuth } from './AuthContext'

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems]   = useState([])
  const [total, setTotal]   = useState(0)

  const refresh = async () => {
    if (!user) { setItems([]); setTotal(0); return }
    try {
      const data = await cartService.get()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch { /* ignore */ }
  }

  useEffect(() => { refresh() }, [user])

  const addItem = async (product, quantity = 1) => {
    await cartService.add({
      product_id:    product.id,
      quantity,
      price:         product.price,
      product_name:  product.name,
      product_image: product.image || product.thumbnail || '',
      sku:           product.sku || String(product.id),
    })
    await refresh()
  }

  const updateQty = async (itemId, quantity) => {
    await cartService.update(itemId, { quantity })
    await refresh()
  }

  const removeItem = async (itemId) => {
    await cartService.remove(itemId)
    await refresh()
  }

  const clearCart = async () => {
    await cartService.clear()
    setItems([]); setTotal(0)
  }

  return (
    <CartCtx.Provider value={{ items, total, addItem, updateQty, removeItem, clearCart, refresh }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => useContext(CartCtx)
