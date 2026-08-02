import { Copy, MailPlus, Pencil, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Invitation, Student, StudentStatus } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import { repositories, usesApiDataSource } from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatCurrency, formatDate } from '../../utils/format';

type StudentForm = Omit<Student, 'id' | 'initials' | 'progress'>;

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createEmptyStudent(): StudentForm {
  const joinedAt = new Date();
  const nextBillingDate = new Date(joinedAt);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  return {
    name: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    plan: 'Essencial',
    monthlyFee: 189.9,
    joinedAt: dateInputValue(joinedAt),
    nextBillingDate: dateInputValue(nextBillingDate),
    goal: '',
    coach: 'Rafael Martins',
  };
}

export function StudentsPage() {
  const [searchParams] = useSearchParams();
  const collection = useAsyncCollection(repositories.students);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState<'ALL' | StudentStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(() => createEmptyStudent());
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Student | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () =>
      collection.items.filter((student) => {
        const matchesSearch = `${student.name} ${student.email} ${student.plan}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === 'ALL' || student.status === status;
        return matchesSearch && matchesStatus;
      }),
    [collection.items, search, status],
  );

  function openCreate() {
    collection.clearError();
    setEditing(null);
    setForm(createEmptyStudent());
    setModalOpen(true);
  }

  function openEdit(student: Student) {
    collection.clearError();
    setEditing(student);
    setForm(student);
    setModalOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const initials = form.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    setSubmitting(true);
    try {
      if (editing) await collection.update({ ...editing, ...form, initials });
      else await collection.create({ ...form, id: createId('student'), initials, progress: 20 });
      setModalOpen(false);
    } catch {
      // The collection exposes the normalized API or storage error in the form.
    } finally {
      setSubmitting(false);
    }
  }

  async function removeStudent(student: Student) {
    setDeletingId(student.id);
    try {
      await collection.remove(student.id);
    } catch {
      // The collection displays the normalized error above the table.
    } finally {
      setDeletingId(null);
      setDeleteCandidate(null);
    }
  }

  async function inviteStudent(student: Student) {
    setInvitingId(student.id);
    collection.clearError();
    try {
      setInvitation(await repositories.students.invite(student.id));
    } catch {
      await collection.reload();
    } finally {
      setInvitingId(null);
    }
  }

  async function copyInvitation() {
    if (!invitation) return;
    await navigator.clipboard.writeText(invitation.activationUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">GESTÃO DE ALUNOS</span>
          <h1>Alunos</h1>
          <p>Centralize cadastro, plano, objetivo e situação financeira.</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openCreate}>
          Novo aluno
        </Button>
      </header>

      {collection.error && !modalOpen && (
        <div className="form-error" role="alert">
          {collection.error}
        </div>
      )}

      <Card className="toolbar-card">
        <label className="search-field">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou plano"
          />
        </label>
        <div className="segmented-control">
          {(['ALL', 'ACTIVE', 'PAUSED', 'INACTIVE'] as const).map((item) => (
            <button
              key={item}
              className={status === item ? 'active' : ''}
              onClick={() => setStatus(item)}
            >
              {item === 'ALL'
                ? 'Todos'
                : item === 'ACTIVE'
                  ? 'Ativos'
                  : item === 'PAUSED'
                    ? 'Pausados'
                    : 'Inativos'}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="table-wrap">
          {collection.loading ? (
            <EmptyState
              title="Carregando alunos"
              description="Aguarde enquanto os dados são consultados."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Nenhum aluno encontrado"
              description="Ajuste os filtros ou cadastre um novo aluno."
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Plano</th>
                  <th>Mensalidade</th>
                  <th>Próxima cobrança</th>
                  <th>Status</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar avatar--small">{student.initials}</span>
                        <div>
                          <strong>{student.name}</strong>
                          <span>{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{student.plan}</strong>
                      <span>{student.goal}</span>
                    </td>
                    <td>{formatCurrency(student.monthlyFee)}</td>
                    <td>{formatDate(student.nextBillingDate)}</td>
                    <td>
                      <Badge status={student.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() => void inviteStudent(student)}
                          aria-label={`Gerar convite para ${student.name}`}
                          title="Gerar convite"
                          disabled={invitingId === student.id}
                        >
                          <MailPlus size={17} />
                        </button>
                        <button onClick={() => openEdit(student)} aria-label="Editar">
                          <Pencil size={17} />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(student)}
                          aria-label="Excluir"
                          disabled={deletingId === student.id}
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
        title={editing ? 'Editar aluno' : 'Novo aluno'}
        description={
          usesApiDataSource
            ? 'Os dados serão persistidos pela API HubFlow Fit.'
            : 'Os dados ficam persistidos no navegador nesta versão demonstrativa.'
        }
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit} className="form-grid">
          {collection.error && (
            <div className="form-error field--span-2" role="alert">
              {collection.error}
            </div>
          )}
          <label className="field field--span-2">
            <span>Nome completo</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Telefone</span>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Plano</span>
            <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
              <option>Essencial</option>
              <option>Performance Pro</option>
              <option>Assessoria Running</option>
            </select>
          </label>
          <label className="field">
            <span>Mensalidade</span>
            <input
              type="number"
              step="0.01"
              value={form.monthlyFee}
              onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="PAUSED">Pausado</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </label>
          <label className="field">
            <span>Próxima cobrança</span>
            <input
              type="date"
              value={form.nextBillingDate}
              onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })}
            />
          </label>
          <label className="field field--span-2">
            <span>Objetivo principal</span>
            <input
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="Ex.: completar a primeira meia maratona"
            />
          </label>
          <div className="modal-actions field--span-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" icon={<UserRoundCheck size={18} />} disabled={submitting}>
              {submitting ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar aluno'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(invitation)}
        title="Convite de acesso"
        description="Envie este link ao aluno. Por segurança, um novo convite invalida o anterior."
        onClose={() => setInvitation(null)}
      >
        <div className="form-stack">
          <label className="field">
            <span>
              Link válido até{' '}
              {invitation ? new Date(invitation.expiresAt).toLocaleString('pt-BR') : ''}
            </span>
            <input readOnly value={invitation?.activationUrl ?? ''} />
          </label>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setInvitation(null)}>
              Fechar
            </Button>
            <Button icon={<Copy size={17} />} onClick={() => void copyInvitation()}>
              {copied ? 'Link copiado' : 'Copiar link'}
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Remover aluno?"
        description={
          deleteCandidate
            ? `Todos os dados vinculados a ${deleteCandidate.name} serão removidos.`
            : ''
        }
        confirmLabel="Remover aluno"
        busy={Boolean(deletingId)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (deleteCandidate) void removeStudent(deleteCandidate);
        }}
      />
    </div>
  );
}
