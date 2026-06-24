'use client';

import Link from 'next/link';
import { AuthProvider } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TicketListSkeleton } from '@/components/shared/LoadingSkeleton';
import { Plus, Ticket } from 'lucide-react';
import { RelativeTime } from '@/components/relative-time';

function TicketListContent() {
  const { tickets, loading } = useTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {loading ? (
        <TicketListSkeleton />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-12 w-12" />}
          title="No tickets yet"
          description="Create your first support ticket to get help from our team."
          action={
            <Button asChild>
              <Link href="/portal/tickets/new">Create Ticket</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/portal/tickets/${ticket.id}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {ticket.ticketNumber}
                        </span>
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <h3 className="font-medium truncate">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {ticket.lastMessagePreview || ticket.description?.substring(0, 100)}
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

export default function TicketsPage() {
  return (
    <AuthProvider>
      <TicketListContent />
    </AuthProvider>
  );
}
