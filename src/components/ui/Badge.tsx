import { statusLabel } from '../../utils/format';

export function Badge({ status }: { status: string }) {
  return <span className={`badge badge--${status.toLowerCase()}`}>{statusLabel(status)}</span>;
}
