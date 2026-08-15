import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';
import type { UserRole } from '../domain/models';
import { useAuth } from '../features/auth/AuthContext';

export function AppLayout({ role }: { role: UserRole }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar role={role} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <main className="page-container">
          {user?.readOnly && (
            <div className="read-only-banner" role="status">
              <ShieldCheck size={18} />
              <div>
                <strong>Modo demonstração</strong>
                <span>Explore todas as telas; alterações permanecem desativadas.</span>
              </div>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
