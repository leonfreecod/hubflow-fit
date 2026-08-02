import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';

function lazyNamed<T extends ComponentType>(
  loader: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] };
  });
}

const LoginPage = lazyNamed(() => import('../pages/auth/LoginPage'), 'LoginPage');
const ActivateAccountPage = lazyNamed(
  () => import('../pages/auth/ActivateAccountPage'),
  'ActivateAccountPage',
);
const ResetPasswordPage = lazyNamed(
  () => import('../pages/auth/ResetPasswordPage'),
  'ResetPasswordPage',
);
const AdminDashboardPage = lazyNamed(
  () => import('../pages/admin/AdminDashboardPage'),
  'AdminDashboardPage',
);
const FinancePage = lazyNamed(() => import('../pages/admin/FinancePage'), 'FinancePage');
const SchedulePage = lazyNamed(() => import('../pages/admin/SchedulePage'), 'SchedulePage');
const SettingsPage = lazyNamed(() => import('../pages/admin/SettingsPage'), 'SettingsPage');
const StudentsPage = lazyNamed(() => import('../pages/admin/StudentsPage'), 'StudentsPage');
const WorkoutsPage = lazyNamed(() => import('../pages/admin/WorkoutsPage'), 'WorkoutsPage');
const StudentHomePage = lazyNamed(
  () => import('../pages/student/StudentHomePage'),
  'StudentHomePage',
);
const StudentPaymentsPage = lazyNamed(
  () => import('../pages/student/StudentPaymentsPage'),
  'StudentPaymentsPage',
);
const StudentProfilePage = lazyNamed(
  () => import('../pages/student/StudentProfilePage'),
  'StudentProfilePage',
);
const StudentSchedulePage = lazyNamed(
  () => import('../pages/student/StudentSchedulePage'),
  'StudentSchedulePage',
);
const StudentWorkoutsPage = lazyNamed(
  () => import('../pages/student/StudentWorkoutsPage'),
  'StudentWorkoutsPage',
);

function route(element: React.ReactNode) {
  return (
    <Suspense fallback={<div className="route-loader">Carregando...</div>}>{element}</Suspense>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: route(<LoginPage />) },
  { path: '/activate', element: route(<ActivateAccountPage />) },
  { path: '/esqueci-senha', element: route(<ResetPasswordPage />) },
  { path: '/reset-password', element: route(<ResetPasswordPage />) },
  {
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AppLayout role="ADMIN" />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: route(<AdminDashboardPage />) },
          { path: 'alunos', element: route(<StudentsPage />) },
          { path: 'agenda', element: route(<SchedulePage />) },
          { path: 'treinos', element: route(<WorkoutsPage />) },
          { path: 'financeiro', element: route(<FinancePage />) },
          { path: 'configuracoes', element: route(<SettingsPage />) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['STUDENT']} />,
    children: [
      {
        path: '/aluno',
        element: <AppLayout role="STUDENT" />,
        children: [
          { index: true, element: <Navigate to="inicio" replace /> },
          { path: 'inicio', element: route(<StudentHomePage />) },
          { path: 'treinos', element: route(<StudentWorkoutsPage />) },
          { path: 'agenda', element: route(<StudentSchedulePage />) },
          { path: 'pagamentos', element: route(<StudentPaymentsPage />) },
          { path: 'perfil', element: route(<StudentProfilePage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
