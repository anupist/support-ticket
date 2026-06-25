'use client';

import { use } from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { TicketChat } from '@/components/TicketChat';

function AdminTicketDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TicketChat ticketId={id} backHref="/admin/tickets" />;
}

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <AdminTicketDetailContent params={params} />
    </AuthProvider>
  );
}