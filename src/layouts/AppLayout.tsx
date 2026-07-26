import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/navigation/Sidebar';
import { Topbar } from '../components/navigation/Topbar';
import type { UserRole } from '../domain/models';

export function AppLayout({ role }: { role: UserRole }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar role={role} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setMenuOpen(true)} />
        <main className="page-container"><Outlet /></main>
      </div>
    </div>
  );
}
