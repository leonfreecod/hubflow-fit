import { Navigate, createBrowserRouter } from 'react-router';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { FinancePage } from '../pages/admin/FinancePage';
import { SchedulePage } from '../pages/admin/SchedulePage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { StudentsPage } from '../pages/admin/StudentsPage';
import { WorkoutsPage } from '../pages/admin/WorkoutsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { StudentHomePage } from '../pages/student/StudentHomePage';
import { StudentPaymentsPage } from '../pages/student/StudentPaymentsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentSchedulePage } from '../pages/student/StudentSchedulePage';
import { StudentWorkoutsPage } from '../pages/student/StudentWorkoutsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [{
      path: '/admin', element: <AppLayout role="ADMIN" />, children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboardPage /> },
        { path: 'alunos', element: <StudentsPage /> },
        { path: 'agenda', element: <SchedulePage /> },
        { path: 'treinos', element: <WorkoutsPage /> },
        { path: 'financeiro', element: <FinancePage /> },
        { path: 'configuracoes', element: <SettingsPage /> },
      ],
    }],
  },
  {
    element: <ProtectedRoute roles={['STUDENT']} />,
    children: [{
      path: '/aluno', element: <AppLayout role="STUDENT" />, children: [
        { index: true, element: <Navigate to="inicio" replace /> },
        { path: 'inicio', element: <StudentHomePage /> },
        { path: 'treinos', element: <StudentWorkoutsPage /> },
        { path: 'agenda', element: <StudentSchedulePage /> },
        { path: 'pagamentos', element: <StudentPaymentsPage /> },
        { path: 'perfil', element: <StudentProfilePage /> },
      ],
    }],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
