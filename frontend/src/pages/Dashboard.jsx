import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { reportesAPI } from '../services/api'
import { FolderOpen, Plus, CheckSquare, BarChart3, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)



useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await reportesAPI.getEstadisticas()
      setStats(response.data)
    } catch (error) {
      console.error('[DASHBOARD] Error al obtener estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (user) fetchStats()
}, [user])



  const quickActions = [
    {
      name: 'Ver Expedientes',
      description: 'Gestionar expedientes existentes',
      href: '/expedientes',
      icon: FolderOpen,
      color: 'bg-blue-500'
    },
    {
      name: 'Nuevo Expediente',
      description: 'Crear un nuevo expediente',
      href: '/expedientes/nuevo',
      icon: Plus,
      color: 'bg-green-500'
    },
    ...(user?.rol === 'coordinador' ? [{
      name: 'Revisión',
      description: 'Revisar expedientes pendientes',
      href: '/revision',
      icon: CheckSquare,
      color: 'bg-orange-500'
    }] : []),
    {
      name: 'Reportes',
      description: 'Ver estadísticas y reportes',
      href: '/reportes',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ]

  if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.nombre}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistema de Gestión de Evidencias - DICRI
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Expedientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalExpedientes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.expedientesPendientes}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completados
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.expedientesCompletados}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Indicios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalIndicios}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                to={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
