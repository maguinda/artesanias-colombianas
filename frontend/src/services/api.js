// src/services/api.js
const BASE = '/api'

function getToken() {
  return localStorage.getItem('ac_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`)
    err.status    = res.status
    err.cs_status = data.cs_status
    err.cs_reason = data.cs_reason
    err.data      = data
    throw err
  }
  return data
}

// Auth
export const authService = {
  login:    (body) => request('/auth/login',    { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me:       ()     => request('/auth/me'),
  updateMe: (body) => request('/auth/me', { method: 'PUT', body }),
}

// Products
export const productsService = {
  getAll:  (params = {}) => request('/products?' + new URLSearchParams(params)),
  getOne:  (id)          => request(`/products/${id}`),
  create:  (body)        => request('/products', { method: 'POST', body }),
  update:  (id, body)    => request(`/products/${id}`, { method: 'PUT', body }),
  delete:  (id)          => request(`/products/${id}`, { method: 'DELETE' }),
}

// Categories
export const categoriesService = {
  getAll:  ()         => request('/categories'),
  getOne:  (id)       => request(`/categories/${id}`),
  create:  (body)     => request('/categories', { method: 'POST', body }),
  update:  (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
  delete:  (id)       => request(`/categories/${id}`, { method: 'DELETE' }),
}

// Cart
export const cartService = {
  get:        ()            => request('/cart'),
  add:        (body)        => request('/cart', { method: 'POST', body }),
  update:     (id, body)    => request(`/cart/${id}`, { method: 'PUT', body }),
  remove:     (id)          => request(`/cart/${id}`, { method: 'DELETE' }),
  clear:      ()            => request('/cart', { method: 'DELETE' }),
}

// Orders
export const ordersService = {
  create:       (body)       => request('/orders',               { method: 'POST',  body }),
  getAll:       ()           => request('/orders'),
  getOne:       (id)         => request(`/orders/${id}`),
  getItems:     (id)         => request(`/orders/${id}`).then(o => o.items || []),
  updateStatus: (id, status) => request(`/orders/${id}/status`,  { method: 'PATCH', body: { status } }),
  savePayment:  (id, data)   => request(`/orders/${id}/payment`, { method: 'PATCH', body: data }),
  cancel:       (id)         => request(`/orders/${id}`,         { method: 'DELETE' }),
}

// Customers (admin)
export const customersService = {
  getAll:  ()         => request('/customers'),
  getOne:  (id)       => request(`/customers/${id}`),
  update:  (id, body) => request(`/customers/${id}`, { method: 'PUT', body }),
  delete:  (id)       => request(`/customers/${id}`, { method: 'DELETE' }),
}

// Payment
export const paymentService = {
  process: (body) => request('/payment', { method: 'POST', body }),
}

// Upload de imágenes
export const uploadService = {
  image: async (file) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`${BASE}/upload/image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,           // NO 'Content-Type' — el browser lo pone solo con boundary
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
    return data  // { url, filename }
  }
}
