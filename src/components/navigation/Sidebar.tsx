import {
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
  Waypoints,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router';
import { brand } from '../../config/brand';
import type { UserRole } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';

const adminItems = [
  { to: '/admin/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { to: '/admin/alunos', label: 'Alunos', icon: UsersRound },
  { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/treinos', label: 'Treinos', icon: Dumbbell },
  { to: '/admin/financeiro', label: 'Financeiro', icon: CreditCard },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

const studentItems = [
  { to: '/aluno/inicio', label: 'Meu painel', icon: ChartNoAxesCombined },
  { to: '/aluno/treinos', label: 'Meus treinos', icon: Dumbbell },
  { to: '/aluno/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/aluno/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { to: '/aluno/perfil', label: 'Meu perfil', icon: UserRound },
];

interface SidebarProps {
  role: UserRole;
  open: boolean;
  onClose(): void;
}

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const items = role === 'ADMIN' ? adminItems : studentItems;

  return (
    <>
      {open && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="brand-mark">
            <Waypoints size={22} />
          </span>
          <div>
            <strong>{brand.name}</strong>
            <small>{brand.suffix}</small>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar__workspace">
          <span>{role === 'ADMIN' ? 'Área da assessoria' : 'Portal do aluno'}</span>
          <strong>{role === 'ADMIN' ? 'Hub Running' : 'Minha evolução'}</strong>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__upgrade">
            <span>PLANO PRO</span>
            <strong>Dados centralizados.</strong>
            <p>Seu negócio e seus alunos em um só fluxo.</p>
          </div>
          <button className="sidebar-link sidebar-link--logout" onClick={logout}>
            <LogOut size={19} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
