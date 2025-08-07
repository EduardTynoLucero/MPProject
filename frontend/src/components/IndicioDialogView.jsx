import { X } from 'lucide-react'
import { formatDate } from '../lib/utils'

export default function IndicioDialogView({ indicio, onClose }) {
  if (!indicio) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detalles del Indicio</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-800">
              <div>
                <span className="font-semibold">Número de Evidencia:</span> {indicio.numero_evidencia}
              </div>
              <div>
                <span className="font-semibold">Tipo:</span> {indicio.tipo}
              </div>
              <div>
                <span className="font-semibold">Fecha de Recolección:</span> {formatDate(indicio.fecha_recoleccion)}
              </div>
              <div>
                <span className="font-semibold">Ubicación del Hallazgo:</span> {indicio.ubicacion_hallazgo || indicio.ubicacion}
              </div>
              <div>
                <span className="font-semibold">Descripción:</span> {indicio.descripcion}
              </div>
              <div>
                <span className="font-semibold">Cadena de Custodia:</span> {indicio.cadena_custodia || 'No especificado'}
              </div>
              <div>
                <span className="font-semibold">Observaciones:</span> {indicio.observaciones || 'Sin observaciones'}
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {(indicio.estado || 'pendiente').replace('_', ' ')}
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={onClose}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
