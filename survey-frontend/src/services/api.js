import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — force logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  updateMe: (data) => api.patch('/auth/me', data),
}

// ── User Surveys ──────────────────────────────────────────
export const surveyApi = {
  getAll:   (params) => api.get('/surveys', { params }),
  getById:  (id)     => api.get(`/surveys/${id}`),
  create:   (data)   => api.post('/surveys', data),
  update:   (id, data) => api.put(`/surveys/${id}`, data),
  delete:   (id)     => api.delete(`/surveys/${id}`),
}

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  getStats:    ()          => api.get('/admin/stats'),
  getAll:      (params)    => api.get('/admin/surveys', { params }),
  getById:     (id)        => api.get(`/admin/surveys/${id}`),
  update:      (id, data)  => api.put(`/admin/surveys/${id}`, data),
  approve:     (id)        => api.put(`/admin/surveys/${id}`, { status: 'Approved' }),
  reject:      (id)        => api.put(`/admin/surveys/${id}`, { status: 'Rejected' }),
  delete:      (id)        => api.delete(`/admin/surveys/${id}`),

  // Download — trigger browser download
  exportCSV: (params) => {
    const query = new URLSearchParams(params).toString()
    const token = localStorage.getItem('token')
    const url = `/api/admin/export/csv${query ? '?' + query : ''}`
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', `surveys-${Date.now()}.csv`)
    // Add auth header by fetching manually
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `surveys-${Date.now()}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
      })
  },

  exportExcel: (params) => {
    const query = new URLSearchParams(params).toString()
    const token = localStorage.getItem('token')
    const url = `/api/admin/export/excel${query ? '?' + query : ''}`
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `surveys-${Date.now()}.xlsx`
        link.click()
        URL.revokeObjectURL(link.href)
      })
  },
}

export default api
