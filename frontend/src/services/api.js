import axios from 'axios'

const API_BASE_URL = '/api' 
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})




api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  console.log('[INTERCEPTOR] Token leído de localStorage:', token)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})




api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
}

export const expedientesAPI = {
  getAll: () => api.get('/expedientes'),
  getById: (id) => api.get(`/expedientes/${id}`),
  create: (data) => api.post('/expedientes', data),
  update: (id, data) => api.put(`/expedientes/${id}`, data),
  delete: (id) => api.delete(`/expedientes/${id}`),
  enviarRevision: (id) => api.put(`/expedientes/${id}/enviar-revision`),
  rechazar: (id, justificacion) => api.put(`/expedientes/${id}/rechazar`, { justificacion }),
  aprobar: (id, data) => api.put(`/expedientes/${id}/aprobar`, data),
  getIndiciosByExpediente: (id) => api.get(`/expedientes/${id}/indicios`), 
  revisar: (id, data) => api.put(`/expedientes/${id}/revisar`, data) ,
  delete: (id) => api.put(`/expedientes/${id}/eliminar`),
}

export const indiciosAPI = {
  getByExpediente: (expedienteId) => api.get(`/indicios/expediente/${expedienteId}`),
  create: (data) => api.post('/indicios', data),
  update: (id, data) => api.put(`/indicios/${id}`, data),
   delete: (id) => api.delete(`/indicios/${id}/logico`),
}

export const reportesAPI = {
  getEstadisticas:      (params) => api.get('/reportes/estadisticas', { params }),
  getExpedientesPorMes: (params) => api.get('/reportes/expedientes-por-mes', { params }),
  getIndiciosPorTipo:   (params) => api.get('/reportes/indicios-por-tipo', { params }),
  getRecientes:         (params) => api.get('/reportes/recientes', { params }),
}
export default api



