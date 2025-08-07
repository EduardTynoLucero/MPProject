import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, FolderOpen, Plus, CheckSquare, BarChart3, LogOut, Menu, X, User } from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Expedientes', href: '/expedientes', icon: FolderOpen },
    { name: 'Nuevo Expediente', href: '/expedientes/nuevo', icon: Plus },
    ...(user?.rol === 'coordinador' ? [
      { name: 'Revisión', href: '/revision', icon: CheckSquare }
    ] : []),
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gray-900/40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">DICRI</h1>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-base transition
                    ${active
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar escritorio */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-100 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">DICRI</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition
                    ${active
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Botón abrir sidebar móvil */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100 lg:hidden">
          <div className="px-2 py-2 sm:px-4">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Evidencias</h2>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.nombre}</span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-xs text-gray-600 ring-1 ring-gray-200">
                    {user?.rol}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
