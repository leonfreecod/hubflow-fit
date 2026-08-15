import { ArrowRight, Check, Eye, EyeOff, Sparkles, Waypoints } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { brand } from '../../config/brand';
import { useAuth } from '../../features/auth/AuthContext';
import { usesApiDataSource } from '../../services/repositories/localRepositories';

export function LoginPage() {
  const localDemoMode = !usesApiDataSource;
  const portfolioDemoMode = usesApiDataSource && import.meta.env.VITE_DEMO_MODE === 'true';
  const demoMode = localDemoMode || portfolioDemoMode;
  const demoEmail = portfolioDemoMode
    ? (import.meta.env.VITE_DEMO_EMAIL ?? 'demo@hubflow.fit')
    : 'admin@hubflow.fit';
  const demoPassword = portfolioDemoMode
    ? (import.meta.env.VITE_DEMO_ACCESS_CODE ?? '')
    : 'hubflow123';
  const [email, setEmail] = useState(demoMode ? demoEmail : '');
  const [password, setPassword] = useState(demoMode ? demoPassword : '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/aluno/inicio', { replace: true });
  }, [user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ok = await login(email, password);
      if (!ok)
        setError(
          demoMode
            ? 'E-mail ou senha inválidos. Use uma das contas demonstrativas.'
            : 'E-mail ou senha inválidos.',
        );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível conectar ao servidor. Tente novamente em instantes.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function selectDemoAccount(role: 'ADMIN' | 'STUDENT') {
    setEmail(role === 'ADMIN' ? 'admin@hubflow.fit' : 'aluno@hubflow.fit');
    setPassword('hubflow123');
    setError('');
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-showcase__content">
          <div className="login-brand">
            <span className="brand-mark brand-mark--large">
              <Waypoints size={27} />
            </span>
            <strong>
              {brand.name}
              <em>{brand.suffix}</em>
            </strong>
          </div>
          <div className="showcase-copy">
            <span className="eyebrow">
              <Sparkles size={15} /> Gestão esportiva, sem planilhas espalhadas
            </span>
            <h1>
              Seu negócio em <mark>um único fluxo.</mark>
            </h1>
            <p>
              Alunos, agenda, treinos e pagamentos conectados em uma plataforma premium para
              treinadores e assessorias.
            </p>
          </div>
          <div className="showcase-metrics">
            <div>
              <strong>Fluxo</strong>
              <span>alunos e planos</span>
            </div>
            <div>
              <strong>Agenda</strong>
              <span>rotina integrada</span>
            </div>
            <div>
              <strong>PIX</strong>
              <span>cobranças organizadas</span>
            </div>
          </div>
          <div className="showcase-points">
            <span>
              <Check size={15} /> Gestão centralizada
            </span>
            <span>
              <Check size={15} /> Portal exclusivo do aluno
            </span>
            <span>
              <Check size={15} /> Indicadores em tempo real
            </span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__heading">
            <h2>Bem-vindo de volta</h2>
            <p>Acesse a plataforma como administrador ou aluno.</p>
          </div>

          {localDemoMode && (
            <div className="demo-switch">
              <button
                type="button"
                className={email.startsWith('admin') ? 'active' : ''}
                onClick={() => selectDemoAccount('ADMIN')}
              >
                <strong>Administrador</strong>
                <span>Gestão completa</span>
              </button>
              <button
                type="button"
                className={email.startsWith('aluno') ? 'active' : ''}
                onClick={() => selectDemoAccount('STUDENT')}
              >
                <strong>Aluno</strong>
                <span>Portal pessoal</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <div className="field">
              <label htmlFor="login-password">
                <span>Senha</span>
              </label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <div className="form-error">{error}</div>}
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Entrando...'
                : portfolioDemoMode
                  ? 'Entrar na demonstração'
                  : 'Entrar na plataforma'}{' '}
              <ArrowRight size={18} />
            </Button>
            {usesApiDataSource && !portfolioDemoMode && (
              <Link className="auth-secondary-link" to="/esqueci-senha">
                Esqueci minha senha
              </Link>
            )}
          </form>

          <p className="login-note">
            {portfolioDemoMode
              ? 'A conta pública permite navegar por todas as telas sem alterar os dados.'
              : usesApiDataSource
                ? 'Sessão protegida pela API HubFlow Fit.'
                : 'Projeto demonstrativo com dados simulados e persistência local.'}
          </p>
        </div>
      </section>
    </main>
  );
}
