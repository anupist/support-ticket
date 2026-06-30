'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TicketListSkeleton } from '@/components/shared/LoadingSkeleton';
import { Plus, Ticket, Search, X, FolderKanban, ChevronDown } from 'lucide-react';
import { RelativeTime } from '@/components/relative-time';
import { formatDate } from '@/lib/utils';
import { apiFetch } from '@/lib/api-client';
import type { TicketStatus, Project } from '@/types';

const STATUS_FILTERS = ['all', 'open', 'in_progress', 'resolved', 'closed'] as const;

const PAGE_SIZES = [10, 20, 50];

function TicketListContent() {
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('project');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState(urlProjectId || '');
  const [pageSize, setPageSize] = useState(10);
  const [projects, setProjects] = useState<Project[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    apiFetch('/api/projects').then((d) => setProjects(d.projects || [])).catch(() => {});
  }, []);

  const { tickets, loading, loadMore, hasMore, totalCount } = useTickets({
    status: statusFilter as TicketStatus | 'all',
    search: debouncedSearch,
    projectId: projectFilter || undefined,
    pageSize,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your support tickets</p>
        </div>
        <Button asChild>
          <Link href="/portal/tickets/new">
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="flex h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Projects</option>
            <option value="__none__">General</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 max-w-sm sm:ml-auto">
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

      {loading && tickets.length === 0 ? (
        <TicketListSkeleton />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12" />}
          title="No tickets found"
          description={searchQuery ? `No tickets matching "${searchQuery}"` : projectFilter ? 'No tickets for this project.' : statusFilter !== 'all' ? `No tickets with status "${statusFilter}"` : 'No tickets yet. Create your first support ticket.'}
          action={
            <Button asChild>
              <Link href="/portal/tickets/new">Create Ticket</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {tickets.length} of {totalCount} tickets</span>
            <div className="flex items-center gap-2">
              <span className="text-xs">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="flex h-7 rounded-md border border-input bg-transparent px-2 text-xs"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/portal/tickets/${ticket.id}`} className="block">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          {ticket.ticketNumber}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {ticket.projectName || 'General'}
                        </span>
                      </div>
                      <h3 className="font-medium truncate">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {ticket.lastMessagePreview || ticket.description?.substring(0, 100)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Created {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-4 shrink-0">
                      <RelativeTime date={ticket.lastActivityAt || ticket.createdAt} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<TicketListSkeleton />}>
        <TicketListContent />
      </Suspense>
    </AuthProvider>
  );
}
