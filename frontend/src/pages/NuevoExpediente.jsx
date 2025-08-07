import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { expedientesAPI } from '../services/api'
import { useToast } from '../hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function NuevoExpediente() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    numero_caso: '',
    descripcion: '',
    ubicacion: '',
    fecha_hecho: '',
    tipo_delito: '',
    prioridad: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await expedientesAPI.create(formData)
      toast({
        title: 'Éxito',
        description: 'Expediente creado correctamente'
      })
      navigate('/expedientes')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el expediente',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="relative">
   
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />

      <div className="relative mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
   
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/expedientes')}
            className="inline-flex items-center rounded-xl border border-transparent bg-white/70 p-2 text-gray-500 shadow-sm ring-1 ring-gray-200 transition hover:bg-white hover:text-gray-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Nuevo Expediente
            </h1>
            <p className="text-sm text-gray-500">
              Crear un nuevo expediente en el sistema
            </p>
          </div>
        </div>

    
        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-lg shadow-indigo-100/30 backdrop-blur-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Datos del expediente
            </h2>
            <p className="text-xs text-gray-500">
              Los campos marcados con <span className="text-rose-600">*</span> son obligatorios
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6">
          
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
         
              <div className="group">
                <label htmlFor="numero_caso" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Número de Caso <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  name="numero_caso"
                  id="numero_caso"
                  required
                  placeholder="Ej. 2025-000123"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={formData.numero_caso}
                  onChange={handleChange}
                />
                <p className="mt-1.5 text-xs text-gray-400">Debe ser único.</p>
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
                  <option value="homicidio">Homicidio</option>
                  <option value="robo">Robo</option>
                  <option value="fraude">Fraude</option>
                  <option value="narcotrafico">Narcotráfico</option>
                  <option value="violencia_domestica">Violencia Doméstica</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="group">
                <label htmlFor="fecha_incidente" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Fecha del Incidente <span className="text-rose-600">*</span>
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
            </div>

       
            <div className="group">
              <label htmlFor="ubicacion" className="mb-1.5 block text-sm font-medium text-gray-700">
                Ubicación <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                name="ubicacion"
                id="ubicacion"
                required
                placeholder="Ej. Zona 1, Ciudad de Guatemala"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.ubicacion}
                onChange={handleChange}
              />
            </div>

            <div className="group">
              <label htmlFor="descripcion" className="mb-1.5 block text-sm font-medium text-gray-700">
                Descripción <span className="text-rose-600">*</span>
              </label>
              <textarea
                name="descripcion"
                id="descripcion"
                rows={4}
                required
                placeholder="Describe brevemente los hechos..."
                className="block w-full resize-y rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                value={formData.descripcion}
                onChange={handleChange}
              />
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-gray-400">Máx. 1000 caracteres aprox.</span>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/expedientes')}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Creando...' : 'Crear Expediente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
