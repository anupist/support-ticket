'use client';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Ticket, Clock, CheckCircle } from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets();

  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'in_progress'
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-muted-foreground">Manage your support tickets</p>
        </div>
        <Button asChild>
          <Link href="/portal/tickets/new">
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : openTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : inProgressTickets}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : resolvedTickets}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border p-8 text-center">
        <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {loading ? 'Loading...' : tickets.length === 0 ? 'No recent tickets' : `${tickets.length} total tickets`}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {tickets.length === 0
            ? 'Create your first support ticket to get help from our team.'
            : 'Click on a ticket to view details and track progress.'}
        </p>
        <Button asChild>
          <Link href="/portal/tickets/new">Create Ticket</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PortalPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
