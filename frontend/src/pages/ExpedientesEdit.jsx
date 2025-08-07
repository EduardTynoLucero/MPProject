import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { expedientesAPI } from '../services/api'
import { useToast } from '../hooks/use-toast'

export default function ExpedienteEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    numero_caso: '',
    descripcion: '',
    fecha_hecho: '',
    tipo_delito: '',
    prioridad: '',
    ubicacion: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchExpediente = async () => {
      try {
        const response = await expedientesAPI.getById(id)
        const expediente = response.data.data

        setFormData({
          numero_caso: expediente.numero_caso || '',
          descripcion: expediente.descripcion || '',
          fecha_hecho: expediente.fecha_hecho?.split('T')[0] || '',
          tipo_delito: expediente.tipo_delito || '',
          prioridad: expediente.prioridad || 'baja',
          ubicacion: expediente.ubicacion || ''
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el expediente',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExpediente()
  }, [id, toast])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await expedientesAPI.update(id, formData)
      toast({
        title: 'Éxito',
        description: 'Expediente actualizado correctamente'
      })
      navigate('/expedientes')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el expediente',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="relative h-64">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />
        <div className="relative flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
 
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />

      <div className="relative mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Editar Expediente</h2>
          <p className="text-sm text-gray-500">Actualiza los datos y guarda los cambios</p>
        </div>


        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-lg shadow-indigo-100/30 backdrop-blur-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">Información general</h3>
            <p className="text-xs text-gray-500">Campos obligatorios marcados con <span className="text-rose-600">*</span></p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
      
            <div className="group">
              <label htmlFor="numero_caso" className="mb-1.5 block text-sm font-medium text-gray-700">
                Número de Caso <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                name="numero_caso"
                id="numero_caso"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.numero_caso}
                onChange={handleChange}
              />
            </div>

           
            <div className="group">
              <label htmlFor="tipo_delito" className="mb-1.5 block text-sm font-medium text-gray-700">
                Tipo de Delito <span className="text-rose-600">*</span>
              </label>
              <select
                name="tipo_delito"
                id="tipo_delito"
                required
                className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.tipo_delito}
                onChange={handleChange}
              >
                <option value="">Seleccionar tipo</option>
                <option value="robo">Robo</option>
                <option value="fraude">Fraude</option>
                <option value="asalto">Asalto</option>
                <option value="homicidio">Homicidio</option>
              </select>
            </div>

        
            <div className="group">
              <label htmlFor="fecha_hecho" className="mb-1.5 block text-sm font-medium text-gray-700">
                Fecha del Hecho <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                name="fecha_hecho"
                id="fecha_hecho"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.fecha_hecho}
                onChange={handleChange}
              />
            </div>

            <div className="group">
              <label htmlFor="prioridad" className="mb-1.5 block text-sm font-medium text-gray-700">
                Prioridad
              </label>
              <select
                name="prioridad"
                id="prioridad"
                className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.prioridad}
                onChange={handleChange}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div className="group md:col-span-2">
              <label htmlFor="ubicacion" className="mb-1.5 block text-sm font-medium text-gray-700">
                Ubicación <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                name="ubicacion"
                id="ubicacion"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.ubicacion}
                onChange={handleChange}
              />
            </div>

      
            <div className="group md:col-span-2">
              <label htmlFor="descripcion" className="mb-1.5 block text-sm font-medium text-gray-700">
                Descripción <span className="text-rose-600">*</span>
              </label>
              <textarea
                name="descripcion"
                id="descripcion"
                rows={4}
                required
                className="block w-full resize-y rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.descripcion}
                onChange={handleChange}
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">Sé claro y conciso.</span>
              </div>
            </div>

   
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
