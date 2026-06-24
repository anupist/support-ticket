'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Clock, CheckCircle, Users } from 'lucide-react';

function AdminDashboard() {
  const { tickets, loading } = useTickets();

  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'in_progress'
  ).length;
  const resolvedToday = tickets.filter(
    (t) => t.status === 'resolved'
  ).length;
  const unassignedTickets = tickets.filter(
    (t) => !t.assignedTo && t.status !== 'closed' && t.status !== 'resolved'
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of support activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : openTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : inProgressTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : unassignedTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : tickets.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets yet. New tickets will appear here.</p>
            ) : (
              <div className="space-y-2">
                {tickets.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm py-1">
                    <span className="font-mono text-xs text-muted-foreground">{t.ticketNumber}</span>
                    <span className="flex-1 ml-2 truncate">{t.subject}</span>
                    <span className="text-xs text-muted-foreground capitalize">{t.status.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Recent activity will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminDashboard />
    </AuthProvider>
  );
}
