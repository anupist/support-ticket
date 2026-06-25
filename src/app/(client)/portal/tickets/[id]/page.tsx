'use client';

import { useState, use, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { useTicket } from '@/hooks/useTicket';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Send, Paperclip, FileText, Image, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatTime, formatDateGroup } from '@/lib/utils';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import type { TicketMessage } from '@/types';

function TicketDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { ticket, loading: ticketLoading, error: ticketError } = useTicket(id);
  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ id: string; name: string; url: string; mimeType: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.media) {
          setPendingFiles((prev) => [...prev, { id: data.media.id, name: file.name, url: data.media.url, mimeType: file.type }]);
        }
      } catch {}
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePendingFile(id: string) {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!newMessage.trim() && pendingFiles.length === 0) || sending) return;
    setSending(true);
    const text = newMessage;
    const attachmentIds = pendingFiles.map((f) => f.id);
    setNewMessage('');
    setPendingFiles([]);

    try {
      await sendMessage(text, 'public', attachmentIds.length > 0 ? attachmentIds : undefined);
    } catch {
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  }

  function getDateKey(msg: TicketMessage): string {
    const d = new Date(msg.createdAt);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  function groupMessagesByDate(msgs: TicketMessage[]): { dateKey: string; label: string; messages: TicketMessage[] }[] {
    const groups: { dateKey: string; label: string; messages: TicketMessage[] }[] = [];
    for (const msg of msgs) {
      const key = getDateKey(msg);
      const last = groups[groups.length - 1];
      if (last && last.dateKey === key) {
        last.messages.push(msg);
      } else {
        groups.push({ dateKey: key, label: formatDateGroup(msg.createdAt), messages: [msg] });
      }
    }
    return groups;
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
        <p className="text-muted-foreground">{ticketError || 'Ticket not found'}</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/portal/tickets">Back to Tickets</Link>
        </Button>
      </div>
    );
  }

  const visibleMessages = messages.filter((m) => m.messageType !== 'internal_note');
  const groupedMessages = groupMessagesByDate(visibleMessages);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-4 shrink-0">
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

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden mb-4">
        <CardContent className="p-4 border-b shrink-0">
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Created {formatDateGroup(ticket.createdAt)} at {formatTime(ticket.createdAt)}
          </p>
        </CardContent>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {messagesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <Skeleton className="h-12 w-3/4 rounded-lg" />
                </div>
              ))}
            </div>
          ) : visibleMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Send a message to start the conversation.
            </p>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.dateKey}>
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">{group.label}</span>
                </div>
                <div className="space-y-1">
                  {group.messages.map((msg, i) => {
                    const isMine = msg.createdBy === user?.uid;
                    const prevMsg = i > 0 ? group.messages[i - 1] : null;
                    const isSameSender = prevMsg && prevMsg.createdBy === msg.createdBy;
                    const showAvatar = !isMine && !isSameSender;
                    const isTemp = msg.id.startsWith('temp-');

                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''} ${isSameSender ? 'mt-0.5' : 'mt-3'}`}>
                        {showAvatar ? (
                          <Avatar src={msg.createdByAvatarUrl?.startsWith('media:') ? `/api/media/${msg.createdByAvatarUrl.replace('media:', '')}` : msg.createdByAvatarUrl || undefined} fallback={msg.createdByName?.[0] || '?'} size="sm" className="mt-0.5 shrink-0" />
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        <div className={`max-w-[75%] ${isMine ? 'items-end' : ''}`}>
                          {!isMine && !isSameSender && (
                            <p className="text-[11px] font-medium text-primary mb-0.5 ml-1">{msg.createdByName}</p>
                          )}
                          <div className={`relative rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}>
                            {msg.body && <p className="break-words">{msg.body}</p>}
                            {msg.attachments?.length > 0 && (
                              <div className={`mt-1.5 space-y-1 ${msg.body ? '' : ''}`}>
                                {msg.attachments.map((a) => renderAttachment(a))}
                              </div>
                            )}
                            <div className="flex items-center gap-1 justify-end mt-0.5">
                              <span className={`text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {isTemp && (
                                <Loader2 className={`h-3 w-3 animate-spin ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {ticket.status !== 'closed' && (
          <div className="border-t p-4 shrink-0">
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {pendingFiles.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm">
                    {f.mimeType.startsWith('image/') ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button onClick={() => removePendingFile(f.id)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="pr-10"
                  disabled={sending}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                  className="absolute right-2 bottom-1/2 translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip" className="hidden" onChange={handleFilePick} />
              </div>
              <Button type="submit" disabled={sending || (!newMessage.trim() && pendingFiles.length === 0)} className="shrink-0">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}

function renderAttachment(a: any) {
  const isImage = a.mimeType?.startsWith('image/');
  if (isImage) {
    return (
      <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block -mx-1 first:-mt-1">
        <img src={a.url} alt={a.fileName} className="max-w-[220px] max-h-[220px] rounded-lg object-cover border hover:opacity-90 transition-opacity" loading="lazy" />
      </a>
    );
  }
  return (
    <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs underline underline-offset-2 hover:text-primary">
      <FileText className="h-3 w-3 shrink-0" />
      {a.fileName}
    </a>
  );
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <TicketDetailContent params={params} />
    </AuthProvider>
  );
}