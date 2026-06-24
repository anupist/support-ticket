import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import type { TicketStatus } from '@/types';

const statusVariants: Record<TicketStatus, 'warning' | 'info' | 'secondary' | 'success' | 'destructive' | 'default'> = {
  open: 'warning',
  in_progress: 'info',
  waiting_on_client: 'secondary',
  waiting_on_agent: 'default',
  resolved: 'success',
  closed: 'destructive',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
