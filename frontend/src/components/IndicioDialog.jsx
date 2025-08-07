import { useState } from 'react'
import { indiciosAPI } from '../services/api'
import { useToast } from '../hooks/use-toast'
import { X } from 'lucide-react'

export default function IndicioDialog({ expedienteId, onClose, onSuccess }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    numero_evidencia: '',
    tipo: '',
    descripcion: '',
    ubicacion: '',
    fecha_recoleccion: '',
    cadena_custodia: '',
    observaciones: '',
    color: '',
    tamanio: '',
    peso: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await indiciosAPI.create({ ...formData, expediente_id: expedienteId })
      toast({ title: 'Éxito', description: 'Indicio agregado correctamente' })
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo agregar el indicio',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal wrapper (centro y padding responsive) */}
      <div className="relative mx-auto flex min-h-screen items-end justify-center p-3 sm:items-center sm:p-6">
        {/* Card */}
        <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-2xl shadow-indigo-100/40 backdrop-blur transition-all sm:max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-semibold text-gray-900">
              Agregar Nuevo Indicio
            </h3>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body con scroll interno para móvil */}
          <div className="max-h-[75vh] overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Grid superior */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="numero_evidencia" className="mb-1 block text-sm font-medium text-gray-700">
                    Número de Evidencia <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="numero_evidencia"
                    id="numero_evidencia"
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.numero_evidencia}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="mb-1 block text-sm font-medium text-gray-700">
                    Tipo de Indicio <span className="text-rose-600">*</span>
                  </label>
                  <select
                    name="tipo"
                    id="tipo"
                    required
                    className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.tipo}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="biologico">Biológico</option>
                    <option value="digital">Digital</option>
                    <option value="fisico">Físico</option>
                    <option value="documental">Documental</option>
                    <option value="fotografico">Fotográfico</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fecha_recoleccion" className="mb-1 block text-sm font-medium text-gray-700">
                    Fecha de Recolección <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_recoleccion"
                    id="fecha_recoleccion"
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.fecha_recoleccion}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="ubicacion" className="mb-1 block text-sm font-medium text-gray-700">
                    Ubicación del Hallazgo <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    id="ubicacion"
                    required
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.ubicacion}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-gray-700">
                  Descripción <span className="text-rose-600">*</span>
                </label>
                <textarea
                  name="descripcion"
                  id="descripcion"
                  rows={3}
                  required
                  className="block w-full resize-y rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </div>

              {/* Atributos opcionales */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="color" className="mb-1 block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    name="color"
                    id="color"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="tamanio" className="mb-1 block text-sm font-medium text-gray-700">Tamaño</label>
                  <input
                    type="text"
                    name="tamanio"
                    id="tamanio"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.tamanio}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="peso" className="mb-1 block text-sm font-medium text-gray-700">Peso</label>
                  <input
                    type="text"
                    name="peso"
                    id="peso"
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={formData.peso}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cadena_custodia" className="mb-1 block text-sm font-medium text-gray-700">
                  Cadena de Custodia
                </label>
                <input
                  type="text"
                  name="cadena_custodia"
                  id="cadena_custodia"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={formData.cadena_custodia}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="observaciones" className="mb-1 block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  id="observaciones"
                  rows={2}
                  className="block w-full resize-y rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={formData.observaciones}
                  onChange={handleChange}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Guardando...' : 'Guardar Indicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
