import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, helper, icon: Icon }: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon">
          <Icon size={19} />
        </span>
      </div>
      <strong>{value}</strong>
      <div className="stat-card__footer">
        <span>{helper}</span>
      </div>
    </Card>
  );
}
