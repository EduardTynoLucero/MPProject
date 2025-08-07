import { useEffect, useState } from 'react'
import { expedientesAPI } from '../services/api'
import { formatDate } from '../lib/utils'
import IndicioDialogView from './IndicioDialogView'

export default function ExpedienteDialogView({ expediente, onClose }) {
  const [indicios, setIndicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIndicio, setSelectedIndicio] = useState(null)

  useEffect(() => {
    const fetchIndicios = async () => {
      try {
        const response = await expedientesAPI.getIndiciosByExpediente(expediente.id)
        setIndicios(response.data.data || [])
      } catch (error) {
        console.error('Error cargando los indicios:', error)
        setIndicios([])
      } finally {
        setLoading(false)
      }
    }

    if (expediente?.id) {
      fetchIndicios()
    }
  }, [expediente?.id])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Detalles del Expediente
        </h2>

        <div className="space-y-1 text-sm text-gray-700 mb-6">
          <p><strong>Código:</strong> {expediente.codigo}</p>
          <p><strong>Número de Caso:</strong> {expediente.numero_caso}</p>
          <p><strong>Estado:</strong> {expediente.estado}</p>
          <p><strong>Descripción:</strong> {expediente.descripcion}</p>
          <p><strong>Tipo de Delito:</strong> {expediente.tipo_delito}</p>
          <p><strong>Técnico:</strong> {expediente.tecnico_nombre}</p>
          <p><strong>Fecha del Hecho:</strong> {formatDate(expediente.fecha_hecho)}</p>
        </div>

        <h3 className="text-lg font-medium text-gray-800 mb-2">Indicios</h3>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando indicios...</p>
        ) : (
          <>
            {indicios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 border-b">#</th>
                      <th className="px-3 py-2 border-b">Número de Evidencia</th>
                      <th className="px-3 py-2 border-b">Tipo</th>
                      <th className="px-3 py-2 border-b">Fecha de Recolección</th>
                      <th className="px-3 py-2 border-b">Ubicación del Hallazgo</th>
                      <th className="px-3 py-2 border-b">Descripción</th>
                      <th className="px-3 py-2 border-b">Cadena de Custodia</th>
                      <th className="px-3 py-2 border-b">Observaciones</th>
                      <th className="px-3 py-2 border-b">Estado</th>
                      <th className="px-3 py-2 border-b">Justificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicios.map((indicio, index) => (
                      <tr
                        key={indicio.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedIndicio(indicio)}
                      >
                        <td className="px-3 py-2 border-b">{index + 1}</td>
                        <td className="px-3 py-2 border-b">{indicio.numero_evidencia}</td>
                        <td className="px-3 py-2 border-b">{indicio.tipo}</td>
                        <td className="px-3 py-2 border-b">{formatDate(indicio.fecha_recoleccion)}</td>
                        <td className="px-3 py-2 border-b">{indicio.ubicacion_hallazgo}</td>
                        <td className="px-3 py-2 border-b">{indicio.descripcion}</td>
                        <td className="px-3 py-2 border-b">{indicio.cadena_custodia}</td>
                        <td className="px-3 py-2 border-b">{indicio.observaciones}</td>
                        <td className="px-3 py-2 border-b">{indicio.estado || 'Sin estado'}</td>
                        <td className="px-3 py-2 border-b">{indicio.razon_rechazo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay indicios registrados.</p>
            )}
          </>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>

      {selectedIndicio && (
        <IndicioDialogView
          indicio={selectedIndicio}
          onClose={() => setSelectedIndicio(null)}
        />
      )}
    </div>
  )
}
