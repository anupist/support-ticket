'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AuthProvider } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TicketListSkeleton } from '@/components/shared/LoadingSkeleton';
import { Ticket, Search, X } from 'lucide-react';
import { RelativeTime } from '@/components/relative-time';
import { formatDate } from '@/lib/utils';
import type { TicketStatus } from '@/types';

const STATUS_FILTERS = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const;

function AdminTicketsContent() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { tickets, loading } = useTickets({
    status: statusFilter as TicketStatus | 'all',
    search: debouncedSearch,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to support tickets</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-9 pr-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <TicketListSkeleton />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12" />}
          title="No tickets found"
          description={searchQuery ? `No tickets matching "${searchQuery}"` : statusFilter !== 'all' ? `No tickets with status "${statusFilter}"` : 'No tickets have been created yet.'}
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        {ticket.assignedToName && (
                          <span className="text-xs text-muted-foreground">
                            Assigned to: {ticket.assignedToName}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium truncate">{ticket.subject}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{ticket.createdByName}</span>
                        <span>{ticket.lastMessagePreview?.substring(0, 60) || ''}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Created {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      <RelativeTime date={ticket.lastActivityAt || ticket.createdAt} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <AuthProvider>
      <AdminTicketsContent />
    </AuthProvider>
  );
}