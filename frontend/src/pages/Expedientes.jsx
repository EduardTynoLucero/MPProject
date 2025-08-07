import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expedientesAPI } from '../services/api'
import { formatDate } from '../lib/utils'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import ExpedienteDialogView from '../components/ExpedienteDialogView'

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExpediente, setSelectedExpediente] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchExpedientes()
  }, [])

  const fetchExpedientes = async () => {
    try {
      const response = await expedientesAPI.getAll()
      setExpedientes(response.data.data.expedientes || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los expedientes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const ok = confirm('¿Seguro que quieres eliminar este expediente?')
    if (!ok) return
    try {
      setDeletingId(id)
      await expedientesAPI.delete(id)
      setExpedientes(prev => prev.filter(exp => exp.id !== id))
      toast({ title: 'Éxito', description: 'Expediente eliminado (desactivado) correctamente' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo eliminar el expediente',
        variant: 'destructive'
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleEnviarRevision = async (id) => {
    try {
      await expedientesAPI.enviarRevision(id)
      toast({ title: 'Éxito', description: 'Expediente enviado a revisión correctamente' })
      fetchExpedientes()
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo enviar a revisión',
        variant: 'destructive'
      })
    }
  }

  const filteredExpedientes = expedientes.filter(exp =>
    (exp.codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (estado) => {
    const e = (estado || '').toLowerCase()
    switch (e) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
      case 'en_proceso': return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
      case 'completado': return 'bg-green-100 text-green-800 ring-1 ring-green-200'
      case 'archivado': return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
      case 'borrador': return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200'
      case 'rechazado': return 'bg-red-100 text-red-800 ring-1 ring-red-200'
      case 'aprobado': return 'bg-green-100 text-green-800 ring-1 ring-green-200'
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

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white" />

      <div className="relative mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
       
        <div className="items-center justify-between gap-3 sm:flex">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">Expedientes</h1>
            <p className="mt-1 text-sm text-gray-600">Gestiona todos los expedientes del sistema</p>
          </div>
          <div className="mt-4 sm:mt-0 w-full sm:w-auto">
            <Link
              to="/expedientes/nuevo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nuevo Expediente
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-lg shadow-indigo-100/30 backdrop-blur-sm sm:p-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Buscar por número de caso o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-lg shadow-indigo-100/30 backdrop-blur-sm">
          {filteredExpedientes.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredExpedientes.map((expediente) => (
                <li key={expediente.id} className="group">
                  <div className="px-4 py-4 transition hover:bg-gray-50 sm:px-6">
                  
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
               
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm sm:h-12 sm:w-12">
                          <span className="text-xs font-semibold sm:text-sm">
                            {(expediente.codigo || '').slice(-2)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
                              {`${expediente.numero_caso} - ${expediente.codigo}`}
                            </p>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(expediente.estado)}`}>
                              {expediente.estado}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{expediente.descripcion}</p>
                          <p className="mt-1 text-xs text-gray-400">Creado: {formatDate(expediente.fecha_hecho)}</p>
                        </div>
                      </div>

               
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <button
                          onClick={() => setSelectedExpediente(expediente)}
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          title="Ver"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {(expediente.estado === 'Borrador' || expediente.estado === 'Rechazado') && (
                          <>
                            <Link
                              to={`/expedientes/${expediente.id}`}
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="Añadir Indicios"
                            >
                              <Plus className="h-5 w-5" />
                            </Link>

                            <Link
                              to={`/expedientes/${expediente.id}/editar`}
                              className="rounded-lg p-2 text-yellow-600 transition hover:bg-yellow-50 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>

                            <button
                              onClick={() => handleDelete(expediente.id)}
                              className={`rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${deletingId === expediente.id ? 'cursor-not-allowed opacity-50' : ''}`}
                              title="Eliminar"
                              disabled={deletingId === expediente.id}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>

                         
                            <button
                              onClick={() => handleEnviarRevision(expediente.id)}
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80" />
                              <span className="hidden xs:inline">Enviar a Revisión</span>
                              <span className="xs:hidden">Revisión</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">No se encontraron expedientes</p>
              <div className="mt-4">
                <Link
                  to="/expedientes/nuevo"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4" />
                  Crear el primero
                </Link>
              </div>
            </div>
          )}
        </div>

        {selectedExpediente && (
          <ExpedienteDialogView
            expediente={selectedExpediente}
            onClose={() => setSelectedExpediente(null)}
          />
        )}
      </div>
    </div>
  )
}
