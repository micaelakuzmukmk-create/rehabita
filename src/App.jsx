import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import SelectProfile from '@/pages/SelectProfile';
import ProfessionalDashboard from '@/pages/profesional/Dashboard';
import PatientDetail from '@/pages/profesional/PatientDetail';
import SessionCreate from '@/pages/profesional/SessionCreate';
import SessionDetail from '@/pages/profesional/SessionDetail';
import RehabPlanEdit from '@/pages/profesional/RehabPlanEdit';
import DeviceConnection from '@/pages/profesional/DeviceConnection';
import Seguimiento from '@/pages/profesional/Seguimiento';
import PatientDashboard from '@/pages/paciente/Dashboard';
import PatientSessionReport from '@/pages/paciente/SessionReport';
import PatientProgress from '@/pages/paciente/Progress';
import PatientSessions from '@/pages/paciente/Sessions';
import PatientCompare from '@/pages/paciente/Compare';
import PatientPlan from '@/pages/paciente/Plan';
import PatientReports from '@/pages/paciente/Reports';
import PatientProfile from '@/pages/paciente/Profile';
import PatientFriends from '@/pages/paciente/Friends';
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
        <Route path="/" element={<Navigate to="/seleccionar-perfil" replace />} />
        <Route path="/seleccionar-perfil" element={<SelectProfile />} />
        <Route element={<Layout />}>
          {/* Área Paciente */}
          <Route path="/paciente" element={<PatientDashboard />} />
          <Route path="/paciente/progreso" element={<PatientProgress />} />
          <Route path="/paciente/sesiones" element={<PatientSessions />} />
          <Route path="/paciente/comparar" element={<PatientCompare />} />
          <Route path="/paciente/plan" element={<PatientPlan />} />
          <Route path="/paciente/reportes" element={<PatientReports />} />
          <Route path="/paciente/amigos" element={<PatientFriends />} />
          <Route path="/paciente/perfil" element={<PatientProfile />} />
          <Route path="/paciente/sesion/:sessionId" element={<PatientSessionReport />} />
          {/* Área Kinesiólogo */}
          <Route path="/kinesiologo/pacientes" element={<ProfessionalDashboard />} />
          <Route path="/kinesiologo/paciente/:patientId" element={<PatientDetail />} />
          <Route path="/kinesiologo/paciente/:patientId/sesion/nueva" element={<SessionCreate />} />
          <Route path="/kinesiologo/paciente/:patientId/plan" element={<RehabPlanEdit />} />
          <Route path="/kinesiologo/sesion/nueva" element={<AreaPlaceholder title="Nueva sesión" description="Seleccioná un paciente desde el listado de Pacientes para iniciar una nueva sesión." icon={Construction} />} />
          <Route path="/kinesiologo/sesiones" element={<AreaPlaceholder title="Sesiones" description="Listado general de sesiones del profesional." icon={Construction} />} />
          <Route path="/kinesiologo/seguimiento" element={<Seguimiento />} />
          <Route path="/kinesiologo/dispositivo" element={<DeviceConnection />} />
          <Route path="/kinesiologo/perfil" element={<AreaPlaceholder title="Perfil" description="Datos del profesional a cargo." icon={Construction} />} />
          <Route path="/kinesiologo/sesion/:sessionId" element={<SessionDetail />} />
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