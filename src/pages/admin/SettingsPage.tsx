import { DatabaseBackup, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { OrganizationSettings } from '../../domain/models';
import { repositories, resetDemoData, usesApiDataSource } from '../../services/repositories/localRepositories';

const fallback: OrganizationSettings = { name: '', document: '', phone: '', email: '', pixKey: '', city: '' };

export function SettingsPage() {
  const [form, setForm] = useState(fallback);
  const [saved, setSaved] = useState(false);
  useEffect(() => { void repositories.organization.get().then(setForm); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); await repositories.organization.save(form); setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="page-stack">
      <header className="page-heading"><div><span className="eyebrow">CONFIGURAÇÕES</span><h1>Organização</h1><p>Dados gerais, cobrança e preferências do ambiente demonstrativo.</p></div></header>
      <section className="settings-grid">
        <Card><div className="section-heading"><div><span>PERFIL DA ASSESSORIA</span><h2>Dados do negócio</h2></div><ShieldCheck size={21} /></div>
          <form onSubmit={submit} className="form-grid settings-form">
            <label className="field field--span-2"><span>Nome da organização</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="field"><span>CNPJ / CPF</span><input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} /></label>
            <label className="field"><span>Cidade</span><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label className="field"><span>Telefone</span><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="field"><span>E-mail</span><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label className="field field--span-2"><span>Chave PIX</span><input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} /></label>
            <div className="modal-actions field--span-2"><span className={saved ? 'save-feedback visible' : 'save-feedback'}>Alterações salvas.</span><Button type="submit" icon={<Save size={18} />}>Salvar configurações</Button></div>
          </form>
        </Card>
        <div className="settings-side">
          <Card><span className="settings-icon"><DatabaseBackup size={22} /></span><h3>Fonte de dados</h3><p>{usesApiDataSource ? 'Esta sessão está conectada à API Spring Boot.' : 'Esta sessão utiliza repositories locais no navegador.'}</p><code>VITE_DATA_SOURCE={usesApiDataSource ? 'api' : 'local'}</code></Card>
          {!usesApiDataSource && <Card><span className="settings-icon"><RotateCcw size={22} /></span><h3>Restaurar demonstração</h3><p>Recarregue os alunos, agenda, treinos e pagamentos originais do projeto.</p><Button variant="secondary" onClick={() => { resetDemoData(); window.location.reload(); }}>Restaurar dados</Button></Card>}
        </div>
      </section>
    </div>
  );
}
