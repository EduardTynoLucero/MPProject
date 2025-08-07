import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { expedientesAPI, indiciosAPI } from '../services/api'
import { formatDate } from '../lib/utils'
import { ArrowLeft, Plus, Edit, Eye, Trash2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import IndicioDialog from '../components/IndicioDialog'
import IndicioDialogEdit from '../components/IndicioDialogEdit'
import IndicioDialogView from '../components/IndicioDialogView'

export default function ExpedienteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [expediente, setExpediente] = useState(null)
  const [indicios, setIndicios] = useState([])
  const [loading, setLoading] = useState(true)

  const [showIndicioDialog, setShowIndicioDialog] = useState(false)
  const [showIndicioDialogEdit, setShowIndicioDialogEdit] = useState(false)
  const [indicioToEdit, setIndicioToEdit] = useState(null)
  const [indicioToView, setIndicioToView] = useState(null)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [expResponse, indiciosResponse] = await Promise.all([
        expedientesAPI.getById(id),
        indiciosAPI.getByExpediente(id),
      ])
      setExpediente(expResponse.data.data)
      setIndicios(indiciosResponse.data.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el expediente',
        variant: 'destructive',
      })
      navigate('/expedientes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIndicio = async (indicioId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este indicio?')) return
    try {
      await indiciosAPI.delete(indicioId)
      setIndicios(indicios.filter((ind) => ind.id !== indicioId))
      toast({ title: 'Éxito', description: 'Indicio eliminado correctamente' })
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el indicio',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
      case 'en_proceso': return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
      case 'completado': return 'bg-green-100 text-green-800 ring-1 ring-green-200'
      case 'archivado': return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
      default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
    }
  }

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'baja': return 'bg-green-100 text-green-800 ring-1 ring-green-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
      case 'alta': return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200'
      case 'critica': return 'bg-red-100 text-red-800 ring-1 ring-red-200'
      default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
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

  if (!expediente) return <div>Expediente no encontrado</div>

  return (
    <div className="relative space-y-6">
    
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />

  
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/expedientes')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">
            Expediente {expediente.numero_caso}
          </h1>
          <p className="text-sm text-gray-500">
            Creado el {formatDate(expediente.fecha_creacion)}
          </p>
        </div>
      </div>

 
      <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-lg shadow-indigo-100/30 backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(expediente.estado)}`}>
                {expediente.estado?.replace('_', ' ') || 'Sin estado'}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Prioridad</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(expediente.prioridad)}`}>
                {expediente.prioridad}
              </span>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Tipo de Delito</dt>
            <dd className="mt-1 text-sm text-gray-900">{expediente.tipo_delito}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
            <dd className="mt-1 text-sm text-gray-900">{expediente.ubicacion}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Fecha del Incidente</dt>
            <dd className="mt-1 text-sm text-gray-900">{formatDate(expediente.fecha_incidente)}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Técnico Asignado</dt>
            <dd className="mt-1 text-sm text-gray-900">{expediente.tecnico_nombre}</dd>
          </div>
        </div>

        <div className="mt-6">
          <dt className="text-sm font-medium text-gray-500">Descripción</dt>
          <dd className="mt-1 text-sm text-gray-900">{expediente.descripcion}</dd>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-lg shadow-indigo-100/30 backdrop-blur-sm">
        <div className="flex flex-col items-start gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Indicios <span className="text-gray-400">({indicios.length})</span>
          </h2>
          <button
            onClick={() => { setIndicioToEdit(null); setShowIndicioDialog(true) }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Agregar Indicio
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {indicios.map((indicio) => (
            <div key={indicio.id} className="px-4 py-4 sm:px-6">
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {indicio.tipo} - {indicio.numero_evidencia}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{indicio.descripcion}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="truncate">Ubicación: {indicio.ubicacion_hallazgo || indicio.ubicacion}</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
                      indicio.estado === 'analizado'
                        ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                        : indicio.estado === 'en_analisis'
                        ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
                        : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
                    }`}>
                      {(indicio.estado || 'pendiente').replace('_', ' ')}
                    </span>
                  </div>
                </div>

         
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => setIndicioToView(indicio)}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Ver"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setIndicioToEdit(indicio); setShowIndicioDialogEdit(true) }}
                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIndicio(indicio.id)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {indicios.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">No hay indicios registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {showIndicioDialog && (
        <IndicioDialog
          expedienteId={id}
          initialData={indicioToEdit}
          onClose={() => { setShowIndicioDialog(false); setIndicioToEdit(null) }}
          onSuccess={() => { setShowIndicioDialog(false); setIndicioToEdit(null); fetchData() }}
        />
      )}

      {showIndicioDialogEdit && (
        <IndicioDialogEdit
          indicio={indicioToEdit}
          onClose={() => { setShowIndicioDialogEdit(false); setIndicioToEdit(null) }}
          onSuccess={() => { setShowIndicioDialogEdit(false); setIndicioToEdit(null); fetchData() }}
        />
      )}

      {indicioToView && (
        <IndicioDialogView indicio={indicioToView} onClose={() => setIndicioToView(null)} />
      )}
    </div>
  )
}
