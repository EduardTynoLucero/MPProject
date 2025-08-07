import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expedientes from './pages/Expedientes'
import NuevoExpediente from './pages/NuevoExpediente'
import ExpedienteEdit from './pages/ExpedientesEdit' 
import ExpedienteDetail from './pages/ExpedienteDetail'
import Revision from './pages/Revision'
import Reportes from './pages/Reportes'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expedientes" element={<Expedientes />} />
        <Route path="/expedientes/nuevo" element={<NuevoExpediente />} />
        <Route path="/expedientes/:id" element={<ExpedienteDetail />} />
            <Route path="/expedientes/:id/editar" element={<ExpedienteEdit />} />
        {user.rol === 'coordinador' && (
          <Route path="/revision" element={<Revision />} />
        )}
        <Route path="/reportes" element={<Reportes />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
