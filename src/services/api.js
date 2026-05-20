import axios from 'axios'
import { supabase } from './supabase'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api'

const api = axios.create({ baseURL: API_BASE, timeout: 30000 })

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Retry GET requests up to 3 times with exponential backoff (1s → 2s → 4s)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config
    if (!config || config.method !== 'get') return Promise.reject(err)
    config._retryCount = (config._retryCount || 0) + 1
    if (config._retryCount > 3) return Promise.reject(err)
    const status = err.response?.status
    if (status && status < 500 && status !== 429) return Promise.reject(err)
    await new Promise((r) => setTimeout(r, 1000 * 2 ** (config._retryCount - 1)))
    return api(config)
  }
)

export function extractErrorMessage(err, fallback = 'Something went wrong.') {
  return err?.response?.data?.message || err?.message || fallback
}

export const uploadFile = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  })
}

export const getKPIs = (fileId) => api.get(`/kpi/${fileId}`)

export const sendChatMessage = (message, fileId) =>
  api.post('/chat', { message, fileId })

export const createCheckoutSession = (plan) =>
  api.post('/payments/checkout', { plan })

export const getSubscription = () => api.get('/payments/subscription')

export const getUserFiles = () => api.get('/files')
export const deleteFile = (id) => api.delete(`/files/${id}`)
export const getChatHistory = (fileId) => api.get(`/chat/history/${fileId}`)
export const createPortalSession = () => api.post('/payments/portal')

export default api
