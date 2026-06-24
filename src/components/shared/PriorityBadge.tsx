import { Badge } from '@/components/ui/badge';
import { PRIORITY_LABELS } from '@/lib/constants';
import type { TicketPriority } from '@/types';

const priorityVariants: Record<TicketPriority, 'secondary' | 'warning' | 'destructive' | 'default'> = {
  low: 'secondary',
  medium: 'default',
  high: 'warning',
  urgent: 'destructive',
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant={priorityVariants[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
