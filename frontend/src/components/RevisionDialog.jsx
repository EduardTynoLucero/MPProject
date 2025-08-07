import { useState } from 'react'
import { expedientesAPI } from '../services/api'
import { useToast } from '../hooks/use-toast'

export default function RevisionDialog({ expediente, onCancel, onConfirm }) {
  const [justificacion, setJustificacion] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

 const handleSubmit = async () => {
  if (!justificacion.trim()) {
    alert('Por favor, ingresa una justificación.')
    return
  }
  setLoading(true)
  try {
    await expedientesAPI.rechazar(expediente.id, justificacion)
    toast({ title: 'Expediente rechazado', description: 'El expediente ha sido devuelto correctamente.' })
    if (onConfirm) onConfirm(expediente.id)
    onCancel()
    window.location.reload() // 🔄 recarga todo
  } catch (error) {
    toast({
      title: 'Error',
      description: 'No se pudo rechazar el expediente',
      variant: 'destructive'
    })
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="fixed inset-0 z-50">
   
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onCancel} />


      <div className="relative mx-auto flex min-h-screen items-end justify-center p-3 sm:items-center sm:p-6">
        {/* Card */}
        <div className="w-[92vw] max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white/95 shadow-2xl shadow-red-100/50 backdrop-blur transition-all">
      
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />

          {/* Header */}
          <div className="px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Rechazar expediente</h2>
            <p className="mt-1 text-xs text-gray-500">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700 ring-1 ring-gray-200">
                {expediente.numero_caso}
              </span>
            </p>
          </div>

       
          <div className="max-h-[70vh] overflow-y-auto px-5 pb-2 sm:px-6">
            <p className="text-sm text-gray-600">
              Escribe la justificación del rechazo. Esta información quedará registrada.
            </p>

            <textarea
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Ej. Faltan pruebas fotográficas y firma del técnico..."
              rows={5}
              className="mt-3 block w-full resize-y rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />

            <div className="mt-1 text-right text-xs text-gray-400">
              {justificacion.trim().length} caracteres
            </div>
          </div>

          {/* Actions: se apilan en móvil */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Rechazando...' : 'Rechazar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
