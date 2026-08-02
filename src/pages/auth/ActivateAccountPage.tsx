import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { apiRequest } from '../../services/api/apiClient';
import { AuthFormShell } from './AuthFormShell';

export function ActivateAccountPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('O link de ativação está incompleto. Solicite um novo convite.');
      return;
    }
    if (password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest<void>('/auth/activate', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ativar sua conta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title={complete ? 'Conta ativada' : 'Crie sua senha'}
      description={
        complete
          ? 'Seu acesso ao portal está pronto.'
          : 'Defina uma senha para concluir o convite enviado pela sua assessoria.'
      }
    >
      {complete ? (
        <div className="auth-success">
          <CheckCircle2 size={42} />
          <Link className="button button--primary button--md" to="/login">
            Acessar a plataforma <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            <span>Nova senha</span>
            <input
              type="password"
              minLength={8}
              maxLength={72}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label className="field">
            <span>Confirme a senha</span>
            <input
              type="password"
              minLength={8}
              maxLength={72}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
            />
          </label>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Ativando...' : 'Ativar minha conta'} <ArrowRight size={18} />
          </Button>
          <Link className="auth-secondary-link" to="/login">
            Voltar ao login
          </Link>
        </form>
      )}
    </AuthFormShell>
  );
}
