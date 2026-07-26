import { CheckCircle2, CircleDollarSign, Clock3, Plus, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { StatCard } from '../../components/ui/StatCard';
import type { Payment, PaymentStatus, Student } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import { repositories } from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatCurrency, formatDate } from '../../utils/format';

export function FinancePage() {
  const collection = useAsyncCollection(repositories.payments);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', description: 'Mensalidade — agosto', amount: 289.9, dueDate: '2026-08-05', status: 'PENDING' as PaymentStatus, method: 'PIX' as Payment['method'] });
  useEffect(() => {
    void repositories.students.findAll().then((items) => {
      setStudents(items);
      setForm((current) => items.some((student) => student.id === current.studentId)
        ? current
        : { ...current, studentId: items[0]?.id ?? '' });
    });
  }, []);

  const paid = collection.items.filter((item) => item.status === 'PAID').reduce((sum, item) => sum + item.amount, 0);
  const pending = collection.items.filter((item) => item.status === 'PENDING').reduce((sum, item) => sum + item.amount, 0);
  const overdue = collection.items.filter((item) => item.status === 'OVERDUE').reduce((sum, item) => sum + item.amount, 0);
  const filtered = useMemo(() => filter === 'ALL' ? collection.items : collection.items.filter((item) => item.status === filter), [collection.items, filter]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const student = students.find((item) => item.id === form.studentId);
    await collection.create({ ...form, id: createId('payment'), studentName: student?.name ?? 'Aluno' });
    setModalOpen(false);
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">CONTROLE FINANCEIRO</span><h1>Financeiro</h1><p>Acompanhe mensalidades, pendências e recebimentos sem depender de planilhas.</p></div><Button icon={<Plus size={18} />} onClick={() => setModalOpen(true)}>Nova cobrança</Button></header>
      <section className="stats-grid stats-grid--three">
        <StatCard label="Recebido" value={formatCurrency(paid)} helper="pagamentos confirmados" trend={12.4} icon={CheckCircle2} />
        <StatCard label="A receber" value={formatCurrency(pending)} helper="dentro do prazo" trend={7.2} icon={Clock3} />
        <StatCard label="Em atraso" value={formatCurrency(overdue)} helper="requer atenção" trend={-3.1} icon={TriangleAlert} />
      </section>
      <Card>
        <div className="section-heading section-heading--wrap"><div><span>LANÇAMENTOS</span><h2>Histórico de cobranças</h2></div><div className="segmented-control">{(['ALL','PAID','PENDING','OVERDUE'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'ALL' ? 'Todas' : item === 'PAID' ? 'Pagas' : item === 'PENDING' ? 'Pendentes' : 'Em atraso'}</button>)}</div></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Aluno</th><th>Descrição</th><th>Vencimento</th><th>Método</th><th>Valor</th><th>Status</th><th /></tr></thead><tbody>
          {filtered.map((payment) => <tr key={payment.id}><td><strong>{payment.studentName}</strong></td><td>{payment.description}</td><td>{formatDate(payment.dueDate)}</td><td>{payment.method}</td><td><strong>{formatCurrency(payment.amount)}</strong></td><td><Badge status={payment.status} /></td><td>{payment.status !== 'PAID' && <button className="table-action" onClick={() => void collection.update({ ...payment, status: 'PAID', paidAt: new Date().toISOString().slice(0, 10) })}><CircleDollarSign size={17} /> Baixar</button>}</td></tr>)}
        </tbody></table></div>
      </Card>

      <Modal open={modalOpen} title="Nova cobrança" description="Registre uma mensalidade, avaliação ou serviço adicional." onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="form-grid">
          <label className="field field--span-2"><span>Aluno</span><select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>{students.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}</select></label>
          <label className="field field--span-2"><span>Descrição</span><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
          <label className="field"><span>Valor</span><input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></label>
          <label className="field"><span>Vencimento</span><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
          <label className="field"><span>Método</span><select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as Payment['method'] })}><option value="PIX">PIX</option><option value="CARD">Cartão</option><option value="TRANSFER">Transferência</option><option value="CASH">Dinheiro</option></select></label>
          <label className="field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}><option value="PENDING">Pendente</option><option value="PAID">Pago</option><option value="OVERDUE">Em atraso</option></select></label>
          <div className="modal-actions field--span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" icon={<CircleDollarSign size={18} />}>Criar cobrança</Button></div>
        </form>
      </Modal>
    </div>
  );
}
