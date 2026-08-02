import { Waypoints } from 'lucide-react';
import type { ReactNode } from 'react';
import { brand } from '../../config/brand';

interface AuthFormShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFormShell({ title, description, children }: AuthFormShellProps) {
  return (
    <main className="auth-action-page">
      <section className="auth-action-card">
        <div className="login-brand auth-action-brand">
          <span className="brand-mark brand-mark--large">
            <Waypoints size={27} />
          </span>
          <strong>
            {brand.name}
            <em>{brand.suffix}</em>
          </strong>
        </div>
        <div className="login-card__heading">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
