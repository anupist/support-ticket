'use client';

import { useState, use } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { useTicket } from '@/hooks/useTicket';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Send, UserPlus, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { TICKET_STATUSES, STATUS_LABELS } from '@/lib/constants';
import type { TicketStatus } from '@/types';

function AdminTicketDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { ticket, loading: ticketLoading } = useTicket(id);
  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(id);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'public' | 'internal_note'>('public');
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const text = newMessage;
    const type = messageType;
    setNewMessage('');

    try {
      await sendMessage(text, type);
    } catch {
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(status: TicketStatus) {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  if (ticketLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/tickets">Back to Tickets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/tickets">
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

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TICKET_STATUSES.filter((s) => s !== ticket.status).map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(s)}
                >
                  {STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Assignment</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {ticket.assignedToName || 'Unassigned'}
              </span>
              <Button variant="ghost" size="icon">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Created by:</span> {ticket.createdByName}</div>
            <div><span className="text-muted-foreground">Created:</span> {formatDate(ticket.createdAt)}</div>
            <div><span className="text-muted-foreground">Messages:</span> {ticket.messageCount || messages.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
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
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.messageType === 'internal_note' ? 'opacity-80' : ''}`}>
              <Avatar fallback={msg.createdByName?.[0] || '?'} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{msg.createdByName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                  {msg.id.startsWith('temp-') && (
                    <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                  )}
                  {msg.messageType === 'internal_note' && (
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                      Internal Note
                    </span>
                  )}
                </div>
                <p className={`text-sm whitespace-pre-wrap rounded-lg p-3 ${
                  msg.messageType === 'internal_note'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-muted'
                }`}>
                  {msg.body}
                </p>
              </div>
            </div>
          ))
        )}

        {ticket.status !== 'closed' && (
          <form onSubmit={handleSend} className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={messageType === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageType('public')}
              >
                Public Reply
              </Button>
              <Button
                type="button"
                variant={messageType === 'internal_note' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageType('internal_note')}
              >
                Internal Note
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={messageType === 'public' ? 'Type your reply...' : 'Add an internal note...'}
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <AdminTicketDetailContent params={params} />
    </AuthProvider>
  );
}
