'use client';

import { use } from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { TicketChat } from '@/components/TicketChat';

function TicketDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TicketChat ticketId={id} backHref="/portal/tickets" />;
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <TicketDetailContent params={params} />
    </AuthProvider>
  );
}