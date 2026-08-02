import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/Button';
import { apiRequest } from '../../services/api/apiClient';
import { AuthFormShell } from './AuthFormShell';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (token && password !== confirmation) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest<void>(
        token ? '/auth/password-reset/confirm' : '/auth/password-reset/request',
        {
          method: 'POST',
          body: JSON.stringify(token ? { token, password } : { email }),
        },
      );
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a solicitação.');
    } finally {
      setSubmitting(false);
    }
  }

  const title = token ? 'Defina uma nova senha' : 'Recupere seu acesso';
  const description = token
    ? 'Escolha uma nova senha para sua conta.'
    : 'Informe seu e-mail. Se houver uma conta ativa, enviaremos as instruções.';

  return (
    <AuthFormShell
      title={complete ? 'Solicitação concluída' : title}
      description={
        complete
          ? token
            ? 'Sua senha foi alterada.'
            : 'Confira seu e-mail para continuar.'
          : description
      }
    >
      {complete ? (
        <div className="auth-success">
          <CheckCircle2 size={42} />
          <Link className="button button--primary button--md" to="/login">
            Voltar ao login <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <form className="form-stack" onSubmit={submit}>
          {token ? (
            <>
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
            </>
          ) : (
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : token ? 'Salvar nova senha' : 'Enviar instruções'}{' '}
            <ArrowRight size={18} />
          </Button>
          <Link className="auth-secondary-link" to="/login">
            Voltar ao login
          </Link>
        </form>
      )}
    </AuthFormShell>
  );
}
