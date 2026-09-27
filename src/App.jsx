import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import ProfessionalDashboard from '@/pages/profesional/Dashboard';
import PatientDetail from '@/pages/profesional/PatientDetail';
import SessionCreate from '@/pages/profesional/SessionCreate';
import SessionDetail from '@/pages/profesional/SessionDetail';
import RehabPlanEdit from '@/pages/profesional/RehabPlanEdit';
import PatientDashboard from '@/pages/paciente/Dashboard';
import PatientSessionReport from '@/pages/paciente/SessionReport';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import PageNotFound from './lib/PageNotFound';
import AreaPlaceholder from '@/components/AreaPlaceholder';
import { Construction } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profesional" element={<ProfessionalDashboard />} />
          <Route path="/profesional/paciente/:patientId" element={<PatientDetail />} />
          <Route path="/profesional/paciente/:patientId/sesion/nueva" element={<SessionCreate />} />
          <Route path="/profesional/paciente/:patientId/plan" element={<RehabPlanEdit />} />
          <Route path="/profesional/sesion/nueva" element={<AreaPlaceholder title="Nueva sesión" description="Seleccioná un paciente desde el listado de Pacientes para iniciar una nueva sesión." icon={Construction} />} />
          <Route path="/profesional/sesiones" element={<AreaPlaceholder title="Sesiones" description="Listado general de sesiones del profesional." icon={Construction} />} />
          <Route path="/profesional/seguimiento" element={<AreaPlaceholder title="Seguimiento" description="Seguimiento global de pacientes y planes activos." icon={Construction} />} />
          <Route path="/profesional/dispositivo" element={<AreaPlaceholder title="Dispositivo" description="Estado y calibración de los dispositivos de medición." icon={Construction} />} />
          <Route path="/profesional/perfil" element={<AreaPlaceholder title="Perfil" description="Datos del profesional a cargo." icon={Construction} />} />
          <Route path="/profesional/sesion/:sessionId" element={<SessionDetail />} />
          <Route path="/paciente" element={<PatientDashboard />} />
          <Route path="/paciente/progreso" element={<AreaPlaceholder title="Mi progreso" description="Evolución detallada de tus indicadores de rehabilitación." icon={Construction} />} />
          <Route path="/paciente/sesiones" element={<AreaPlaceholder title="Mis sesiones" description="Historial de tus sesiones de rehabilitación." icon={Construction} />} />
          <Route path="/paciente/comparar" element={<AreaPlaceholder title="Comparar sesiones" description="Compará tus métricas entre sesiones." icon={Construction} />} />
          <Route path="/paciente/plan" element={<AreaPlaceholder title="Plan de rehabilitación" description="Detalle de tu plan y etapa actual." icon={Construction} />} />
          <Route path="/paciente/reportes" element={<AreaPlaceholder title="Reportes" description="Reportes de evolución para compartir con tu kinesiólogo." icon={Construction} />} />
          <Route path="/paciente/perfil" element={<AreaPlaceholder title="Perfil" description="Tus datos personales y de rehabilitación." icon={Construction} />} />
          <Route path="/paciente/sesion/:sessionId" element={<PatientSessionReport />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App