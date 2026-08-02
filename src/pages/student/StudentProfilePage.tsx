import { Mail, Phone, Save, ShieldCheck, Target, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Student } from '../../domain/models';
import { useAuth } from '../../features/auth/AuthContext';
import { repositories } from '../../services/repositories/localRepositories';
import { formatDate } from '../../utils/format';

export function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.linkedStudentId) {
      setLoading(false);
      setError('Sua conta não possui um aluno vinculado.');
      return;
    }
    let active = true;
    void repositories.students
      .findById(user.linkedStudentId)
      .then((item) => {
        if (active) setStudent(item);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o perfil.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.linkedStudentId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!student) return;
    setSubmitting(true);
    setError(null);
    try {
      setStudent(await repositories.students.update(student));
      await refreshUser();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o perfil.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="route-loader">Carregando perfil...</div>;
  if (!student)
    return (
      <EmptyState title="Perfil indisponível" description={error ?? 'Aluno não encontrado.'} />
    );

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">PERFIL</span>
          <h1>Meus dados</h1>
          <p>Mantenha suas informações de contato e objetivo atualizados.</p>
        </div>
      </header>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <section className="profile-grid">
        <Card className="profile-summary">
          <span className="profile-avatar">{student.initials}</span>
          <h2>{student.name}</h2>
          <p>{student.plan}</p>
          <div className="profile-summary__items">
            <span>
              <Mail size={16} />
              {student.email}
            </span>
            <span>
              <Phone size={16} />
              {student.phone}
            </span>
            <span>
              <Target size={16} />
              {student.goal}
            </span>
          </div>
          <div className="profile-progress">
            <div>
              <span>Evolução do objetivo</span>
              <strong>{student.progress}%</strong>
            </div>
            <i>
              <b style={{ width: `${student.progress}%` }} />
            </i>
          </div>
          <small>Aluno desde {formatDate(student.joinedAt)}</small>
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <span>DADOS PESSOAIS</span>
              <h2>Editar informações</h2>
            </div>
            <UserRound size={21} />
          </div>
          <form onSubmit={submit} className="form-grid settings-form">
            <label className="field field--span-2">
              <span>Nome completo</span>
              <input
                required
                value={student.name}
                onChange={(event) => setStudent({ ...student, name: event.target.value })}
              />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                required
                type="email"
                value={student.email}
                onChange={(event) => setStudent({ ...student, email: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input
                required
                value={student.phone}
                onChange={(event) => setStudent({ ...student, phone: event.target.value })}
              />
            </label>
            <label className="field field--span-2">
              <span>Objetivo</span>
              <textarea
                required
                rows={3}
                value={student.goal}
                onChange={(event) => setStudent({ ...student, goal: event.target.value })}
              />
            </label>
            <div className="privacy-note field--span-2">
              <ShieldCheck size={18} />
              <span>
                Seus dados são exibidos apenas para a equipe responsável pelo seu acompanhamento.
              </span>
            </div>
            <div className="modal-actions field--span-2">
              <span className={saved ? 'save-feedback visible' : 'save-feedback'}>
                Perfil atualizado.
              </span>
              <Button type="submit" icon={<Save size={18} />} disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
