'use client';

import { useState, use } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { useTicket } from '@/hooks/useTicket';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Send, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/shared/LoadingSkeleton';

function TicketDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ticket, loading: ticketLoading, error: ticketError } = useTicket(id);
  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const text = newMessage;
    setNewMessage('');

    try {
      await sendMessage(text, 'public');
    } catch {
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  }

  if (ticketLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-muted-foreground">
          {ticketError || 'Ticket not found'}
        </p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/portal/tickets">Back to Tickets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-muted-foreground">{ticket.ticketNumber}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Created {formatDate(ticket.createdAt)}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Conversation</h2>

        {messagesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-16 flex-1 rounded-lg" />
              </div>
            ))}
          </div>
        ) : messages.filter((m) => m.messageType !== 'internal_note').length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Send a message to start the conversation.
          </p>
        ) : (
          messages
            .filter((m) => m.messageType !== 'internal_note')
            .map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar fallback={msg.createdByName?.[0] || '?'} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{msg.createdByName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </span>
                    {msg.id.startsWith('temp-') && (
                      <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted rounded-lg p-3">
                    {msg.body}
                  </p>
                </div>
              </div>
            ))
        )}

        {ticket.status !== 'closed' && (
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <TicketDetailContent params={params} />
    </AuthProvider>
  );
}
