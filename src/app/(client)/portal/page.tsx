'use client';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { useTickets } from '@/hooks/useTickets';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Clock, CheckCircle, XCircle, TrendingUp, PieChart as PieChartIcon, FolderKanban, BarChart3 } from 'lucide-react';
import { TicketTrendChart } from '@/components/charts/TicketTrendChart';
import { StatusDonutChart } from '@/components/charts/StatusDonutChart';
import { ProjectTicketChart } from '@/components/charts/ProjectTicketChart';

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

function DashboardContent() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets();
  const [projectCount, setProjectCount] = useState<number>(0);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((d) => { setProjectCount(d.projects?.length || 0); setProjectsLoading(false); })
      .catch(() => setProjectsLoading(false));
  }, []);

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;
  const closedTickets = tickets.filter((t) => t.status === 'closed').length;

  const dash = (v: number) => loading ? '-' : v;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground">View your support tickets and projects</p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        <StatCard title="Total Tickets" value={dash(totalTickets)} icon={Ticket} color="text-muted-foreground" />
        <StatCard title="Open" value={dash(openTickets)} icon={Ticket} color="text-amber-500" />
        <StatCard title="In Progress" value={dash(inProgressTickets)} icon={Clock} color="text-blue-500" />
        <StatCard title="Resolved" value={dash(resolvedTickets)} icon={CheckCircle} color="text-green-500" />
        <StatCard title="Closed" value={dash(closedTickets)} icon={XCircle} color="text-gray-500" />
        <StatCard title="Total Projects" value={projectsLoading ? '-' : projectCount} icon={FolderKanban} color="text-violet-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Ticket Trend (30 days)" icon={TrendingUp}>
          <TicketTrendChart />
        </ChartCard>
        <ChartCard title="Status Distribution" icon={PieChartIcon}>
          <StatusDonutChart />
        </ChartCard>
      </div>

      <ChartCard title="Project-wise Tickets" icon={BarChart3}>
        <ProjectTicketChart />
      </ChartCard>
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