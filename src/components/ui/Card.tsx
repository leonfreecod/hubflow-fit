import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
}

export function Card({ children, interactive = false, className = '', ...props }: CardProps) {
  return <div className={`card ${interactive ? 'card--interactive' : ''} ${className}`} {...props}>{children}</div>;
}
