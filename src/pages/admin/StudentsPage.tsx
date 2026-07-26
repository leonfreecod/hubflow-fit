import { Pencil, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import type { Student, StudentStatus } from '../../domain/models';
import { useAsyncCollection } from '../../hooks/useAsyncCollection';
import { repositories } from '../../services/repositories/localRepositories';
import { createId } from '../../services/storage/storage';
import { formatCurrency, formatDate } from '../../utils/format';

const emptyStudent: Omit<Student, 'id' | 'initials' | 'progress'> = {
  name: '', email: '', phone: '', status: 'ACTIVE', plan: 'Essencial', monthlyFee: 189.9,
  joinedAt: new Date().toISOString().slice(0, 10), nextBillingDate: '2026-08-10', goal: '', coach: 'Rafael Martins',
};

export function StudentsPage() {
  const collection = useAsyncCollection(repositories.students);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | StudentStatus>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyStudent);

  const filtered = useMemo(() => collection.items.filter((student) => {
    const matchesSearch = `${student.name} ${student.email} ${student.plan}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'ALL' || student.status === status;
    return matchesSearch && matchesStatus;
  }), [collection.items, search, status]);

  function openCreate() { setEditing(null); setForm(emptyStudent); setModalOpen(true); }
  function openEdit(student: Student) { setEditing(student); setForm(student); setModalOpen(true); }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const initials = form.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    if (editing) await collection.update({ ...editing, ...form, initials });
    else await collection.create({ ...form, id: createId('student'), initials, progress: 20 });
    setModalOpen(false);
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">GESTÃO DE ALUNOS</span><h1>Alunos</h1><p>Centralize cadastro, plano, objetivo e situação financeira.</p></div><Button icon={<Plus size={18} />} onClick={openCreate}>Novo aluno</Button></header>

      <Card className="toolbar-card">
        <label className="search-field"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou plano" /></label>
        <div className="segmented-control">
          {(['ALL', 'ACTIVE', 'PAUSED', 'INACTIVE'] as const).map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item === 'ALL' ? 'Todos' : item === 'ACTIVE' ? 'Ativos' : item === 'PAUSED' ? 'Pausados' : 'Inativos'}</button>)}
        </div>
      </Card>

      <Card>
        <div className="table-wrap">
          {filtered.length === 0 ? <EmptyState title="Nenhum aluno encontrado" description="Ajuste os filtros ou cadastre um novo aluno." /> : (
            <table className="data-table"><thead><tr><th>Aluno</th><th>Plano</th><th>Mensalidade</th><th>Próxima cobrança</th><th>Status</th><th aria-label="Ações" /></tr></thead><tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td><div className="person-cell"><span className="avatar avatar--small">{student.initials}</span><div><strong>{student.name}</strong><span>{student.email}</span></div></div></td>
                  <td><strong>{student.plan}</strong><span>{student.goal}</span></td>
                  <td>{formatCurrency(student.monthlyFee)}</td><td>{formatDate(student.nextBillingDate)}</td><td><Badge status={student.status} /></td>
                  <td><div className="row-actions"><button onClick={() => openEdit(student)} aria-label="Editar"><Pencil size={17} /></button><button onClick={() => { if (confirm(`Remover ${student.name}?`)) void collection.remove(student.id); }} aria-label="Excluir"><Trash2 size={17} /></button></div></td>
                </tr>
              ))}
            </tbody></table>
          )}
        </div>
      </Card>

      <Modal open={modalOpen} title={editing ? 'Editar aluno' : 'Novo aluno'} description="Os dados ficam persistidos no navegador nesta versão demonstrativa." onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="form-grid">
          <label className="field field--span-2"><span>Nome completo</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field"><span>E-mail</span><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="field"><span>Telefone</span><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="field"><span>Plano</span><select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}><option>Essencial</option><option>Performance Pro</option><option>Assessoria Running</option></select></label>
          <label className="field"><span>Mensalidade</span><input type="number" step="0.01" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: Number(e.target.value) })} /></label>
          <label className="field"><span>Status</span><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}><option value="ACTIVE">Ativo</option><option value="PAUSED">Pausado</option><option value="INACTIVE">Inativo</option></select></label>
          <label className="field"><span>Próxima cobrança</span><input type="date" value={form.nextBillingDate} onChange={(e) => setForm({ ...form, nextBillingDate: e.target.value })} /></label>
          <label className="field field--span-2"><span>Objetivo principal</span><input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="Ex.: completar a primeira meia maratona" /></label>
          <div className="modal-actions field--span-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button type="submit" icon={<UserRoundCheck size={18} />}>{editing ? 'Salvar alterações' : 'Cadastrar aluno'}</Button></div>
        </form>
      </Modal>
    </div>
  );
}
