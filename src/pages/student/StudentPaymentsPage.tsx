import { CheckCircle2, Copy, CreditCard, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { OrganizationSettings, Payment } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';
import { formatCurrency, formatDate } from '../../utils/format';

export function StudentPaymentsPage() {
  const { user } = useAuth(); const [payments, setPayments] = useState<Payment[]>([]); const [org, setOrg] = useState<OrganizationSettings | null>(null); const [copied, setCopied] = useState(false);
  useEffect(() => { if (user?.linkedStudentId) void Promise.all([repositories.payments.findAll(), repositories.organization.get()]).then(([items, settings]) => { setPayments(items.filter((payment) => payment.studentId === user.linkedStudentId)); setOrg(settings); }); }, [user]);
  const pending = payments.find((payment) => payment.status !== 'PAID');
  function copyPix() { if (!org) return; void navigator.clipboard?.writeText(org.pixKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return <div className="page-stack"><header className="page-heading"><div><span className="eyebrow">PAGAMENTOS</span><h1>Minha mensalidade</h1><p>Consulte cobranças, vencimentos e histórico de pagamentos.</p></div></header>{pending ? <Card className="payment-highlight"><div><span className="payment-highlight__icon"><QrCode size={28}/></span><span className="eyebrow">PAGAMENTO EM ABERTO</span><h2>{formatCurrency(pending.amount)}</h2><p>{pending.description} · vence em {formatDate(pending.dueDate)}</p></div><div className="pix-box"><small>CHAVE PIX</small><strong>{org?.pixKey}</strong><Button onClick={copyPix} icon={copied ? <CheckCircle2 size={18}/> : <Copy size={18}/>}>{copied ? 'Chave copiada' : 'Copiar chave'}</Button></div></Card> : <Card className="all-paid"><CheckCircle2 size={36}/><h2>Você está em dia.</h2><p>Nenhuma cobrança pendente no momento.</p></Card>}<Card><div className="section-heading"><div><span>HISTÓRICO</span><h2>Pagamentos anteriores</h2></div><CreditCard size={21}/></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Descrição</th><th>Vencimento</th><th>Pagamento</th><th>Método</th><th>Valor</th><th>Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td><strong>{payment.description}</strong></td><td>{formatDate(payment.dueDate)}</td><td>{payment.paidAt ? formatDate(payment.paidAt) : '—'}</td><td>{payment.method}</td><td>{formatCurrency(payment.amount)}</td><td><Badge status={payment.status}/></td></tr>)}</tbody></table></div></Card></div>;
}
