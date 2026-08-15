import { CheckCircle2, Copy, CreditCard, QrCode } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import type { OrganizationSettings, Payment, PixCharge } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';
import { formatCurrency, formatDate } from '../../utils/format';

export function StudentPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [organization, setOrganization] = useState<OrganizationSettings | null>(null);
  const [pixCharge, setPixCharge] = useState<PixCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.linkedStudentId) {
      setLoading(false);
      setError('Sua conta não possui um aluno vinculado.');
      return;
    }
    let active = true;
    setLoading(true);
    void Promise.all([repositories.payments.findAll(), repositories.organization.get()])
      .then(([items, settings]) => {
        if (!active) return;
        setPayments(items.filter((payment) => payment.studentId === user.linkedStudentId));
        setOrganization(settings);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : 'Não foi possível carregar os pagamentos.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const pending = useMemo(
    () =>
      [...payments]
        .filter((payment) => payment.status !== 'PAID')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0],
    [payments],
  );

  async function generatePixCharge() {
    if (!pending) return;
    setGenerating(true);
    setError(null);
    try {
      setPixCharge(await repositories.payments.getOrCreatePixCharge(pending.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível gerar a cobrança PIX.');
    } finally {
      setGenerating(false);
    }
  }

  async function copyPix() {
    const value = pixCharge?.copyPaste ?? organization?.pixKey;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione o código manualmente.');
    }
  }

  if (loading) return <div className="route-loader">Carregando pagamentos...</div>;

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">PAGAMENTOS</span>
          <h1>Minha mensalidade</h1>
          <p>Consulte cobranças, vencimentos e histórico de pagamentos.</p>
        </div>
      </header>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {pending ? (
        <Card className="payment-highlight">
          <div>
            <span className="payment-highlight__icon">
              <QrCode size={28} />
            </span>
            <span className="eyebrow">PAGAMENTO EM ABERTO</span>
            <h2>{formatCurrency(pending.amount)}</h2>
            <p>
              {pending.description} · vence em {formatDate(pending.dueDate)}
            </p>
          </div>
          <div className="pix-box">
            <small>{pixCharge ? 'PIX COPIA E COLA' : 'PAGAMENTO VIA PIX'}</small>
            <strong>{pixCharge?.copyPaste ?? organization?.pixKey ?? 'Chave indisponível'}</strong>
            {pixCharge?.simulated && (
              <p className="pix-warning">
                Ambiente local: este código simula a integração e não é pagável em aplicativo
                bancário.
              </p>
            )}
            {pending.method === 'PIX' && !pixCharge ? (
              <Button
                onClick={() => void generatePixCharge()}
                disabled={generating}
                icon={<QrCode size={18} />}
              >
                {generating ? 'Gerando...' : 'Gerar cobrança PIX'}
              </Button>
            ) : (
              <Button
                onClick={() => void copyPix()}
                icon={copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              >
                {copied ? 'Código copiado' : 'Copiar código'}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="all-paid">
          <CheckCircle2 size={36} />
          <h2>Você está em dia.</h2>
          <p>Nenhuma cobrança pendente no momento.</p>
        </Card>
      )}
      <Card>
        <div className="section-heading">
          <div>
            <span>HISTÓRICO</span>
            <h2>Pagamentos anteriores</h2>
          </div>
          <CreditCard size={21} />
        </div>
        {payments.length === 0 ? (
          <EmptyState
            title="Nenhum pagamento"
            description="Ainda não há cobranças vinculadas à sua conta."
          />
        ) : (
          <div className="table-wrap table-wrap--responsive">
            <table className="data-table data-table--responsive">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Vencimento</th>
                  <th>Pagamento</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td data-label="Descrição">
                      <strong>{payment.description}</strong>
                    </td>
                    <td data-label="Vencimento">{formatDate(payment.dueDate)}</td>
                    <td data-label="Pagamento">
                      {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                    </td>
                    <td data-label="Método">{payment.method}</td>
                    <td data-label="Valor">{formatCurrency(payment.amount)}</td>
                    <td data-label="Status">
                      <Badge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
