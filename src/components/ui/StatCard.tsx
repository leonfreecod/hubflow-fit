import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  helper: string;
  trend?: number;
  icon: LucideIcon;
}

export function StatCard({ label, value, helper, trend, icon: Icon }: StatCardProps) {
  const positive = (trend ?? 0) >= 0;
  return (
    <Card className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon"><Icon size={19} /></span>
      </div>
      <strong>{value}</strong>
      <div className="stat-card__footer">
        {trend !== undefined && (
          <span className={positive ? 'trend trend--positive' : 'trend trend--negative'}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
        <span>{helper}</span>
      </div>
    </Card>
  );
}
