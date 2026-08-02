import { Menu, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/AuthContext';

export function Topbar({ onMenuClick }: { onMenuClick(): void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    navigate(
      user?.role === 'ADMIN'
        ? `/admin/alunos?q=${encodeURIComponent(normalized)}`
        : '/aluno/treinos',
    );
  }

  return (
    <header className="topbar">
      <button className="topbar__menu icon-button" onClick={onMenuClick} aria-label="Abrir menu">
        <Menu size={20} />
      </button>
      <div className="topbar__date">
        <span>Hoje</span>
        <strong>{today}</strong>
      </div>
      <form className="topbar__search" role="search" onSubmit={submitSearch}>
        <Search size={17} />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={user?.role === 'ADMIN' ? 'Buscar alunos...' : 'Buscar treinos...'}
          aria-label="Busca global"
        />
        <kbd>⌘ K</kbd>
      </form>
      <div className="topbar__profile">
        <span className="avatar">
          {user?.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('')}
        </span>
        <div>
          <strong>{user?.name}</strong>
          <small>{user?.role === 'ADMIN' ? 'Administrador' : 'Aluno'}</small>
        </div>
      </div>
    </header>
  );
}
