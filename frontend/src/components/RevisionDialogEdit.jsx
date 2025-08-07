import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { expedientesAPI } from '../services/api'

export default function RevisionDialogEdit({ expediente, onClose }) {
  const [indicios, setIndicios] = useState([])
  const [estadoIndicios, setEstadoIndicios] = useState({})
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchIndicios()
  }, [])

  const fetchIndicios = async () => {
    try {
      const response = await expedientesAPI.getById(expediente.id)
      const activos = response.data.data.indicios.filter(indicio => indicio.is_active)
      setIndicios(activos)

      const estadoInicial = {}
      activos.forEach(indicio => {
        estadoInicial[indicio.id] = { estado: '', justificacion: '' }
      })
      setEstadoIndicios(estadoInicial)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los indicios',
        variant: 'destructive',
      })
    }
  }

  const handleEstadoChange = (id, nuevoEstado) => {
    setEstadoIndicios(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        estado: nuevoEstado,
        justificacion: nuevoEstado === 'Rechazado' ? prev[id].justificacion || '' : ''
      }
    }))
  }

  const handleJustificacionChange = (id, texto) => {
    setEstadoIndicios(prev => ({
      ...prev,
      [id]: { ...prev[id], justificacion: texto }
    }))
  }

  const handleConfirm = async () => {
    const tieneIndefinidos = Object.entries(estadoIndicios).some(([, { estado }]) => !estado)
    const rechazosSinJustificacion = Object.entries(estadoIndicios).some(
      ([, { estado, justificacion }]) => estado === 'Rechazado' && justificacion.trim() === ''
    )

    if (tieneIndefinidos) {
      toast({ title: 'Faltan decisiones', description: 'Selecciona una opción para todos los indicios.', variant: 'destructive' })
      return
    }
    if (rechazosSinJustificacion) {
      toast({ title: 'Justificación requerida', description: 'Todos los rechazos deben tener una justificación.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await expedientesAPI.revisar(expediente.id, estadoIndicios)
      toast({ title: 'Revisión guardada', description: 'El expediente e indicios han sido procesados' })
      onClose()
    } catch (error) {
      toast({ title: 'Error', description: 'Ocurrió un error al guardar la revisión', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Wrapper */}
      <div className="relative mx-auto flex min-h-screen items-end justify-center p-3 sm:items-center sm:p-6">
        {/* Card */}
        <div className="w-[92vw] max-w-2xl overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-2xl shadow-indigo-100/40 backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Revisar expediente <span className="font-bold">#{expediente.numero_caso}</span>
            </h2>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body con scroll */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4 sm:px-6">
            {indicios.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                Este expediente no tiene indicios activos.
              </div>
            ) : (
              <div className="space-y-4">
                {indicios.map(indicio => {
                  const estadoActual = estadoIndicios[indicio.id]?.estado || ''
                  const justificacion = estadoIndicios[indicio.id]?.justificacion || ''

                  return (
                    <div
                      key={indicio.id}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 shadow-sm ring-1 ring-gray-100"
                    >
                      {/* Cabecera de la tarjeta */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{indicio.descripcion}</p>
                          <p className="mt-0.5 text-xs text-gray-500">Tipo: {indicio.tipo}</p>
                        </div>

                        <div className="sm:min-w-[220px]">
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Decisión
                          </label>
                          <select
                            value={estadoActual}
                            onChange={(e) => handleEstadoChange(indicio.id, e.target.value)}
                            className="block w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          >
                            <option value="">Selecciona una opción</option>
                            <option value="Aprobado">Aprobar</option>
                            <option value="Rechazado">Rechazar</option>
                          </select>
                        </div>
                      </div>

                      {/* Justificación si Rechazado */}
                      {estadoActual === 'Rechazado' && (
                        <div className="mt-3">
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Justificación del rechazo
                          </label>
                          <textarea
                            value={justificacion}
                            onChange={(e) => handleJustificacionChange(indicio.id, e.target.value)}
                            rows={2}
                            placeholder="Explica brevemente el motivo…"
                            className="block w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                          <div className="mt-1 text-right text-[11px] text-gray-400">
                            {justificacion.trim().length} caracteres
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Confirmar revisión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
