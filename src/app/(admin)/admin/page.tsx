'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { useAuthStore } from '@/stores/authStore';
import { useTickets } from '@/hooks/useTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Clock, CheckCircle, XCircle, Users, Activity, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { TicketTrendChart } from '@/components/charts/TicketTrendChart';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { PriorityBarChart } from '@/components/charts/PriorityBarChart';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const storeUser = useAuthStore((s) => s.user);
  const { tickets, loading } = useTickets();

  const isSuperAdmin = storeUser?.role === 'super_admin';

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;
  const closedTickets = tickets.filter((t) => t.status === 'closed').length;
  const unassignedTickets = tickets.filter((t) => !t.assignedTo && t.status !== 'closed' && t.status !== 'resolved').length;

  const dash = (v: number) => loading ? '-' : v;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of support activity</p>
      </div>

      <div className={`grid gap-4 grid-cols-2 md:grid-cols-3 ${isSuperAdmin ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
        <StatCard title="Total Tickets" value={dash(totalTickets)} icon={Ticket} color="text-muted-foreground" />
        <StatCard title="Open" value={dash(openTickets)} icon={Ticket} color="text-amber-500" />
        <StatCard title="In Progress" value={dash(inProgressTickets)} icon={Clock} color="text-blue-500" />
        <StatCard title="Resolved" value={dash(resolvedTickets)} icon={CheckCircle} color="text-green-500" />
        <StatCard title="Closed" value={dash(closedTickets)} icon={XCircle} color="text-gray-500" />
        {isSuperAdmin && <StatCard title="Unassigned" value={dash(unassignedTickets)} icon={Users} color="text-red-500" />}
      </div>

      <div className="space-y-4">
        <ChartCard title="Ticket Trend (30 days)" icon={TrendingUp}>
          <TicketTrendChart />
        </ChartCard>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Status Distribution" icon={PieChartIcon}>
            <StatusDonutChart />
          </ChartCard>
          <ChartCard title="Priority Breakdown" icon={BarChart3}>
            <PriorityBarChart />
          </ChartCard>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tickets yet.</p>
              ) : (
                <div className="space-y-1">
                  {tickets.slice(0, 6).map((t) => (
                    <Link key={t.id} href={`/admin/tickets/${t.id}`} className="flex items-center justify-between text-sm py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors">
                      <span className="font-mono text-xs text-muted-foreground">{t.ticketNumber}</span>
                      <span className="flex-1 ml-2 truncate text-foreground">{t.subject}</span>
                      <span className="text-xs text-muted-foreground capitalize shrink-0">{t.status.replace(/_/g, ' ')}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-8 text-center">Recent activity will appear here.</p>
            </CardContent>
          </Card>
        </div>
      )}
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