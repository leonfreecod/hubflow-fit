import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export function Topbar({ onMenuClick }: { onMenuClick(): void }) {
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());

  return (
    <header className="topbar">
      <button className="topbar__menu icon-button" onClick={onMenuClick} aria-label="Abrir menu"><Menu size={20} /></button>
      <div className="topbar__date"><span>Hoje</span><strong>{today}</strong></div>
      <label className="topbar__search">
        <Search size={17} />
        <input placeholder="Buscar alunos, pagamentos..." />
        <kbd>⌘ K</kbd>
      </label>
      <button className="icon-button notification-button" aria-label="Notificações"><Bell size={19} /><span /></button>
      <div className="topbar__profile">
        <span className="avatar">{user?.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
        <div><strong>{user?.name}</strong><small>{user?.role === 'ADMIN' ? 'Administrador' : 'Aluno'}</small></div>
      </div>
    </header>
  );
}
