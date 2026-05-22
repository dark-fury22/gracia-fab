export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers }
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || `Request failed: ${response.status}`)
  return data
}