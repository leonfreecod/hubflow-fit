import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { StatCard } from '../../components/ui/StatCard';
import type { Payment, PaymentStatus, Student } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import { repositories, usesApiDataSource } from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatCurrency, formatDate } from '../../utils/format';

type PaymentForm = Pick<
  Payment,
  'studentId' | 'description' | 'amount' | 'dueDate' | 'status' | 'method'
>;

function createEmptyForm(studentId = ''): PaymentForm {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dueDate);
  return {
    studentId,
    description: `Mensalidade — ${month}`,
    amount: 289.9,
    dueDate: dueDate.toISOString().slice(0, 10),
    status: 'PENDING',
    method: 'PIX',
  };
}

function currentDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FinancePage() {
  const collection = useAsyncCollection(repositories.payments);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<PaymentForm>(() => createEmptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Payment | null>(null);

  useEffect(() => {
    let active = true;
    setStudentsLoading(true);
    setStudentsError(null);
    void repositories.students
      .findAll()
      .then((items) => {
        if (!active) return;
        setStudents(items);
        setForm((current) =>
          items.some((student) => student.id === current.studentId)
            ? current
            : { ...current, studentId: items[0]?.id ?? '' },
        );
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setStudentsError(
          cause instanceof Error ? cause.message : 'Não foi possível carregar os alunos.',
        );
      })
      .finally(() => {
        if (active) setStudentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const paid = collection.items
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + item.amount, 0);
  const pending = collection.items
    .filter((item) => item.status === 'PENDING')
    .reduce((sum, item) => sum + item.amount, 0);
  const overdue = collection.items
    .filter((item) => item.status === 'OVERDUE')
    .reduce((sum, item) => sum + item.amount, 0);
  const filtered = useMemo(
    () =>
      filter === 'ALL'
        ? collection.items
        : collection.items.filter((item) => item.status === filter),
    [collection.items, filter],
  );
  const visibleError = collection.error ?? studentsError;

  function openCreate() {
    collection.clearError();
    setEditing(null);
    setForm(createEmptyForm(students[0]?.id));
    setModalOpen(true);
  }

  function openEdit(payment: Payment) {
    collection.clearError();
    setEditing(payment);
    setForm({
      studentId: payment.studentId,
      description: payment.description,
      amount: payment.amount,
      dueDate: payment.dueDate,
      status: payment.status,
      method: payment.method,
    });
    setModalOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const student = students.find((item) => item.id === form.studentId);
    if (!student) {
      setStudentsError('Selecione um aluno válido para a cobrança.');
      return;
    }

    const paidAt = form.status === 'PAID' ? (editing?.paidAt ?? currentDate()) : undefined;
    const payment: Payment = {
      ...form,
      id: editing?.id ?? createId('payment'),
      studentName: student.name,
      amount: Math.round((form.amount + Number.EPSILON) * 100) / 100,
      ...(paidAt ? { paidAt } : {}),
    };

    setSubmitting(true);
    try {
      if (editing) await collection.update(payment);
      else await collection.create(payment);
      setModalOpen(false);
    } catch {
      // The collection exposes the normalized API or storage error in the form.
    } finally {
      setSubmitting(false);
    }
  }

  async function markPaid(payment: Payment) {
    setActiveActionId(payment.id);
    try {
      await collection.mutate(() => repositories.payments.markPaid(payment.id));
    } catch {
      // The collection displays the normalized error above the table.
    } finally {
      setActiveActionId(null);
    }
  }

  async function removePayment(payment: Payment) {
    setActiveActionId(payment.id);
    try {
      await collection.remove(payment.id);
    } catch {
      // The collection displays the normalized error above the table.
    } finally {
      setActiveActionId(null);
      setDeleteCandidate(null);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">CONTROLE FINANCEIRO</span>
          <h1>Financeiro</h1>
          <p>Acompanhe mensalidades, pendências e recebimentos sem depender de planilhas.</p>
        </div>
        <Button
          icon={<Plus size={18} />}
          onClick={openCreate}
          disabled={studentsLoading || students.length === 0}
        >
          Nova cobrança
        </Button>
      </header>
      {visibleError && !modalOpen && (
        <div className="form-error" role="alert">
          {visibleError}
        </div>
      )}
      <section className="stats-grid stats-grid--three">
        <StatCard
          label="Recebido"
          value={formatCurrency(paid)}
          helper="pagamentos confirmados"
          icon={CheckCircle2}
        />
        <StatCard
          label="A receber"
          value={formatCurrency(pending)}
          helper="dentro do prazo"
          icon={Clock3}
        />
        <StatCard
          label="Em atraso"
          value={formatCurrency(overdue)}
          helper="requer atenção"
          icon={TriangleAlert}
        />
      </section>
      <Card>
        <div className="section-heading section-heading--wrap">
          <div>
            <span>LANÇAMENTOS</span>
            <h2>Histórico de cobranças</h2>
          </div>
          <div className="segmented-control">
            {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((item) => (
              <button
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item === 'ALL'
                  ? 'Todas'
                  : item === 'PAID'
                    ? 'Pagas'
                    : item === 'PENDING'
                      ? 'Pendentes'
                      : 'Em atraso'}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          {collection.loading ? (
            <EmptyState
              title="Carregando pagamentos"
              description="Aguarde enquanto as cobranças são consultadas."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum pagamento encontrado"
              description="Ajuste o filtro ou crie uma nova cobrança."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Descrição</th>
                  <th>Vencimento</th>
                  <th>Método</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>{payment.studentName}</strong>
                    </td>
                    <td>{payment.description}</td>
                    <td>{formatDate(payment.dueDate)}</td>
                    <td>{payment.method}</td>
                    <td>
                      <strong>{formatCurrency(payment.amount)}</strong>
                    </td>
                    <td>
                      <Badge status={payment.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {payment.status !== 'PAID' && (
                          <button
                            className="table-action"
                            onClick={() => void markPaid(payment)}
                            disabled={activeActionId === payment.id}
                          >
                            <CircleDollarSign size={17} /> Baixar
                          </button>
                        )}
                        <button onClick={() => openEdit(payment)} aria-label="Editar pagamento">
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(payment)}
                          aria-label="Excluir pagamento"
                          disabled={activeActionId === payment.id}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar cobrança' : 'Nova cobrança'}
        description={
          usesApiDataSource
            ? 'A cobrança será vinculada ao aluno e persistida pela API.'
            : 'Registre uma mensalidade, avaliação ou serviço adicional.'
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit} className="form-grid">
          {visibleError && (
            <div className="form-error field--span-2" role="alert">
              {visibleError}
            </div>
          )}
          <label className="field field--span-2">
            <span>Aluno</span>
            <select
              required
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              {students.map((student) => (
                <option value={student.id} key={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field field--span-2">
            <span>Descrição</span>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </label>
          <label className="field">
            <span>Valor</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Vencimento</span>
            <input
              type="date"
              required
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Método</span>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value as Payment['method'] })}
            >
              <option value="PIX">PIX</option>
              <option value="CARD">Cartão</option>
              <option value="TRANSFER">Transferência</option>
              <option value="CASH">Dinheiro</option>
            </select>
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={form.status === 'OVERDUE' ? 'PENDING' : form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
            >
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
            </select>
            <small>O atraso é calculado automaticamente pelo vencimento.</small>
          </label>
          <div className="modal-actions field--span-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" icon={<CircleDollarSign size={18} />} disabled={submitting}>
              {submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar cobrança'}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Excluir cobrança?"
        description={
          deleteCandidate
            ? `${deleteCandidate.description} de ${deleteCandidate.studentName} será removida.`
            : ''
        }
        confirmLabel="Excluir cobrança"
        busy={Boolean(activeActionId)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (deleteCandidate) void removePayment(deleteCandidate);
        }}
      />
    </div>
  );
}
