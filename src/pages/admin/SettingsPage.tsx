import { RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import type { OrganizationSettings } from '../../domain/models';
import {
  repositories,
  resetDemoData,
  usesApiDataSource,
} from '../../services/repositories/localRepositories';

const fallback: OrganizationSettings = {
  name: '',
  document: '',
  phone: '',
  email: '',
  pixKey: '',
  city: '',
};

export function SettingsPage() {
  const [form, setForm] = useState(fallback);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void repositories.organization
      .get()
      .then((settings) => {
        if (active) setForm(settings);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error ? cause.message : 'Não foi possível carregar a organização.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      setForm(await repositories.organization.save(form));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a organização.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="route-loader">Carregando organização...</div>;
  if (error && !form.name)
    return <EmptyState title="Não foi possível carregar a organização" description={error} />;

  return (
    <div className="page-stack">
      <section className="settings-container">
        <header className="page-heading">
          <div>
            <span className="eyebrow">CONFIGURAÇÕES</span>
            <h1>Organização</h1>
            <p>Dados gerais e informações de cobrança da assessoria.</p>
          </div>
        </header>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <Card className="settings-card">
          <div className="section-heading">
            <div>
              <span>PERFIL DA ASSESSORIA</span>
              <h2>Dados do negócio</h2>
            </div>
            <ShieldCheck size={21} />
          </div>
          <form onSubmit={submit} className="form-grid settings-form">
            <label className="field field--span-2">
              <span>Nome da organização</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>CNPJ / CPF</span>
              <input
                value={form.document}
                onChange={(e) => setForm({ ...form, document: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Cidade</span>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="field field--span-2">
              <span>Chave PIX</span>
              <input
                value={form.pixKey}
                onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
              />
            </label>
            <div className="modal-actions field--span-2">
              <span className={saved ? 'save-feedback visible' : 'save-feedback'}>
                Alterações salvas.
              </span>
              <Button type="submit" icon={<Save size={18} />} disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar configurações'}
              </Button>
            </div>
          </form>
        </Card>
        {!usesApiDataSource && (
          <Card className="settings-card settings-restore-card">
            <span className="settings-icon">
              <RotateCcw size={22} />
            </span>
            <h3>Restaurar demonstração</h3>
            <p>Recarregue os alunos, agenda, treinos e pagamentos originais do projeto.</p>
            <Button
              variant="secondary"
              onClick={() => {
                resetDemoData();
                window.location.reload();
              }}
            >
              Restaurar dados
            </Button>
          </Card>
        )}
      </section>
    </div>
  );
}
