import { useState, useEffect } from 'react'
import { expedientesAPI } from '../services/api'
import { formatDate } from '../lib/utils'
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import RevisionDialog from '../components/RevisionDialog'
import RevisionDialogEdit from '../components/RevisionDialogEdit'

const TABS = ['Pendientes', 'Revisado', 'Aprobados', 'Rechazados']

export default function Revision() {
  const [expedientes, setExpedientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExpediente, setSelectedExpediente] = useState(null)
  const [editDialogExpediente, setEditDialogExpediente] = useState(null)
  const [activeTab, setActiveTab] = useState('Pendientes')
  const { toast } = useToast()

  useEffect(() => {
    fetchExpedientes()
  }, [])

  const fetchExpedientes = async () => {
    try {
      const response = await expedientesAPI.getAll()
      setExpedientes(response.data.data.expedientes)
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

  const handleApprove = async (id) => {
    try {
      await expedientesAPI.aprobar(id, { estado: 'Aprobado' })
      toast({ title: 'Éxito', description: 'Expediente aprobado correctamente' })
      fetchExpedientes()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo aprobar el expediente',
        variant: 'destructive'
      })
    }
  }

  const handleRejectWithReason = async (id, justificacion) => {
    try {
      await expedientesAPI.update(id, { estado: 'pendiente', justificacion })
      toast({ title: 'Rechazado', description: 'El expediente ha sido rechazado' })
      fetchExpedientes()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar el expediente',
        variant: 'destructive'
      })
    }
  }

  const filteredExpedientes = expedientes.filter(exp => {
    switch (activeTab) {
      case 'Pendientes':
        return exp.estado === 'En Revision'
      case 'Revisado':
        return exp.estado === 'Revisado'
      case 'Aprobados':
        return exp.estado === 'Aprobado'
      case 'Rechazados':
        return exp.estado === 'Rechazado'
      default:
        return false
    }
  })

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
    <div className="relative space-y-6">
    
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Revisión de Expedientes</h1>
        <p className="mt-1 text-sm text-gray-600">Revisa y gestiona los expedientes por estado</p>
      </div>


<div className="rounded-2xl border border-gray-100 bg-white/90 p-2 shadow-sm backdrop-blur">
  <div className="flex flex-wrap gap-2">
    {TABS.map(tab => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`text-center rounded-xl px-4 py-2 text-sm font-semibold transition
          /* En pantallas muy pequeñas: 1 por fila */
          basis-full
          /* >=360px: 2 por fila */
          min-[360px]:basis-[calc(50%-0.25rem)]
          /* >=640px (sm): todos en una línea, ancho auto */
          sm:basis-auto sm:flex-none
          ${activeTab === tab
            ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
      >
        {tab}
      </button>
    ))}
  </div>
</div>



      {/* Lista */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-lg shadow-indigo-100/30 backdrop-blur-sm">
        {filteredExpedientes.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {filteredExpedientes.map((expediente) => (
              <li key={expediente.id} className="group">
                <div className="px-4 py-4 transition hover:bg-gray-50 sm:px-6">
             
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
               
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {expediente.numero_caso}
                          </p>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 ring-1 ring-yellow-200">
                            {expediente.estado}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {expediente.descripcion}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span>Técnico: {expediente.tecnico_nombre}</span>
                          <span>Creado: {formatDate(expediente.fecha_creacion)}</span>
                          <span>Tipo: {expediente.tipo_delito}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones: wrap en móvil */}
                    {(activeTab === 'Pendientes' || activeTab === 'Revisado') && (
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <button
                          onClick={() => handleApprove(expediente.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => setSelectedExpediente(expediente)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </button>

                        {activeTab === 'Pendientes' && (
                          <button
                            onClick={() => setEditDialogExpediente(expediente)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden xs:inline">Revisión Detallada</span>
                            <span className="xs:hidden">Revisión</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No hay expedientes en esta categoría
            </h3>
            <p className="mt-1 text-sm text-gray-500">Selecciona otra pestaña para continuar.</p>
          </div>
        )}
      </div>

  
      {selectedExpediente && (
        <RevisionDialog
          expediente={selectedExpediente}
          onCancel={() => setSelectedExpediente(null)}
          onConfirm={(justificacion) => {
            handleRejectWithReason(selectedExpediente.id, justificacion)
            setSelectedExpediente(null)
          }}
        />
      )}

 
      {editDialogExpediente && (
        <RevisionDialogEdit
          expediente={editDialogExpediente}
          onClose={() => {
            setEditDialogExpediente(null)
            fetchExpedientes()
          }}
        />
      )}
    </div>
  )
}
