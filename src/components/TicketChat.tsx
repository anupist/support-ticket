'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/stores/authStore';
import { useTicket } from '@/hooks/useTicket';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { Avatar } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Send, Paperclip, FileText, Image, X, Loader2 } from 'lucide-react';
import { formatTime, formatDate, formatDateGroup } from '@/lib/utils';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { TICKET_STATUSES, STATUS_LABELS } from '@/lib/constants';
import { can } from '@/lib/permissions';
import type { TicketStatus, Role } from '@/types';
import type { TicketMessage } from '@/types';

interface TicketChatProps {
  ticketId: string;
  backHref: string;
}

export function TicketChat({ ticketId, backHref }: TicketChatProps) {
  const { user } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const { ticket, loading: ticketLoading, refresh: refreshTicket, updateTicket } = useTicket(ticketId);
  const { messages, loading: messagesLoading, sendMessage } = useTicketMessages(ticketId);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'public' | 'internal_note'>('public');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ id: string; name: string; url: string; mimeType: string }[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [resultDialog, setResultDialog] = useState<{ title: string; message: string; variant?: 'default' | 'destructive' } | null>(null);
  const [confirmState, setConfirmState] = useState<{ title: string; message: string; variant?: 'default' | 'destructive'; onConfirm: () => void } | null>(null);
  const [creatorUser, setCreatorUser] = useState<any>(null);
  const [assigneeUser, setAssigneeUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const role = (storeUser?.role || 'client') as Role;
  const customPerms = storeUser?.customPermissions as string[] | undefined;

  const isStaff = role === 'agent' || role === 'super_admin';
  const canViewInternal = isStaff;
  const canReplyInternal = can(role, 'message.reply_internal', customPerms);
  const canUpdateStatus = can(role, 'ticket.update_status', customPerms);
  const canClose = can(role, 'ticket.close', customPerms);
  const canAssign = can(role, 'ticket.assign', customPerms);

  useEffect(() => {
    if (canAssign) {
      fetch('/api/users').then((r) => r.json()).then((data) => {
        if (data.users) setUsers(data.users.filter((u: any) => u.role === 'agent' || u.role === 'super_admin'));
      }).catch(() => {});
    }
  }, [canAssign]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!ticket) return;
    fetch(`/api/users/${ticket.createdBy}`).then((r) => r.json()).then((d) => setCreatorUser(d.user)).catch(() => {});
    if (ticket.assignedTo) {
      fetch(`/api/users/${ticket.assignedTo}`).then((r) => r.json()).then((d) => setAssigneeUser(d.user)).catch(() => {});
    }
  }, [ticket]);

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
    const type = messageType;
    const attachmentIds = pendingFiles.map((f) => f.id);
    setNewMessage('');
    setPendingFiles([]);

    try {
      await sendMessage(text, type, attachmentIds.length > 0 ? attachmentIds : undefined);
    } catch {
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(status: TicketStatus) {
    setConfirmState({
      title: 'Change Status',
      message: `Are you sure you want to change status to "${STATUS_LABELS[status]}"?`,
      variant: status === 'closed' ? 'destructive' : 'default',
      onConfirm: async () => {
        setConfirmState(null);
        try {
          const res = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
          if (!res.ok) {
            let msg = 'Failed to update status';
            try { const e = await res.json(); msg = e.error?.message || e.error || msg; } catch {}
            throw new Error(msg);
          }
          const updated = await res.json();
          updateTicket(updated.ticket);
          refreshTicket();
          setResultDialog({ title: 'Status Changed', message: `Status changed to "${STATUS_LABELS[status]}"`, variant: 'default' });
        } catch (err: any) {
          setResultDialog({ title: 'Error', message: err.message || 'Something went wrong', variant: 'destructive' });
        }
      },
    });
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
      if (last && last.dateKey === key) { last.messages.push(msg); }
      else { groups.push({ dateKey: key, label: formatDateGroup(msg.createdAt), messages: [msg] }); }
    }
    return groups;
  }

  const visibleMessages = canViewInternal ? messages : messages.filter((m) => m.messageType !== 'internal_note');
  const groupedMessages = groupMessagesByDate(visibleMessages);

  if (ticketLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-12"><p className="text-muted-foreground">Ticket not found</p></div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)] max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <a href={backHref}><X className="h-5 w-5" /></a>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-mono text-muted-foreground">{ticket.ticketNumber}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {ticket.projectName || 'General'}
            </span>
          </div>
          <h1 className="text-xl font-bold truncate">{ticket.subject}</h1>
        </div>
      </div>

      {/* Staff: status/assignment/details cards */}
      {isStaff && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 shrink-0">
          {canUpdateStatus && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TICKET_STATUSES.filter((s) => s !== ticket.status).map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => updateStatus(s)}>
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {role === 'super_admin' && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Assignment</CardTitle></CardHeader>
              <CardContent>
                <select
                  value={ticket.assignedTo || ''}
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (!val) return;
                    setAssigning(true);
                    try {
                      const assignRes = await fetch(`/api/tickets/${ticketId}/assign`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ assignedTo: val }),
                      });
                      if (!assignRes.ok) {
                        let msg = 'Failed to assign ticket';
                        try { const e = await assignRes.json(); msg = e.error?.message || e.error || msg; } catch {}
                        throw new Error(msg);
                      }
                      const assignData = await assignRes.json();
                      updateTicket(assignData.ticket);
                      refreshTicket();
                      setResultDialog({ title: 'Assigned', message: `Ticket assigned to ${assignData.ticket.assignedToName || 'agent'}`, variant: 'default' });
                    } catch (err: any) {
                      setResultDialog({ title: 'Error', message: err.message || 'Something went wrong', variant: 'destructive' });
                    }
                    setAssigning(false);
                  }}
                  disabled={assigning}
                  className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  <option value="">{assigning ? 'Assigning...' : 'Unassigned'}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.role})</option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={creatorUser?.avatarUrl?.startsWith('media:') ? `/api/media/${creatorUser.avatarUrl.replace('media:', '')}` : creatorUser?.avatarUrl || undefined}
                  fallback={ticket.createdByName?.[0] || '?'}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ticket.createdByName}</p>
                  <p className="text-xs text-muted-foreground truncate">{creatorUser?.email || ''}</p>
                </div>
              </div>
              <div><span className="text-muted-foreground">Created:</span> {formatDate(ticket.createdAt)}</div>
              <div><span className="text-muted-foreground">Project:</span> {ticket.projectName || 'General'}</div>
              <div><span className="text-muted-foreground">Messages:</span> {ticket.messageCount || messages.length}</div>
              {role === 'super_admin' && ticket.assignedTo && assigneeUser && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Assigned to</p>
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={assigneeUser?.avatarUrl?.startsWith('media:') ? `/api/media/${assigneeUser.avatarUrl.replace('media:', '')}` : assigneeUser?.avatarUrl || undefined}
                      fallback={ticket.assignedToName?.[0] || '?'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ticket.assignedToName}</p>
                      <p className="text-xs text-muted-foreground truncate">{assigneeUser?.email || ''}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Client close button */}
      {!isStaff && canClose && ticket.status !== 'closed' && (
        <div className="flex justify-end mb-4 shrink-0">
          <Button variant="destructive" size="sm" onClick={() => updateStatus('closed')}>
            Close Ticket
          </Button>
        </div>
      )}

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden mb-4">
        <CardContent className="p-4 border-b shrink-0 space-y-3">
          <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {ticket.attachments.map((a) => renderAttachment(a))}
            </div>
          )}
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
            <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
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
                    const isNote = msg.messageType === 'internal_note' && canViewInternal;
                    const showAvatar = !isMine && !isSameSender;
                    const isTemp = msg.id.startsWith('temp-');

                    if (isNote) {
                      return (
                        <div key={msg.id} className="flex justify-center py-2">
                          <div className="w-full max-w-[85%] bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-semibold tracking-wider text-amber-700 dark:text-amber-300 uppercase">Internal Note</span>
                              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">{msg.createdByName}</span>
                              {isTemp && <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />}
                            </div>
                            <p className="text-sm whitespace-pre-wrap text-amber-800 dark:text-amber-200">{msg.body}</p>
                            {msg.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1">{msg.attachments.map((a) => renderAttachment(a))}</div>
                            )}
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 text-right mt-1">{formatTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : ''} ${isSameSender ? 'mt-0.5' : 'mt-3'}`}>
                        {isMine ? (
                          <div className="max-w-[85%] sm:max-w-[75%]">
                            <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3.5 py-2 text-sm whitespace-pre-wrap">
                              {msg.body && <p className="break-words">{msg.body}</p>}
                              {msg.attachments?.length > 0 && (
                                <div className="mt-1.5 space-y-1">{msg.attachments.map((a) => renderAttachment(a))}</div>
                              )}
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <span className="text-[10px] text-primary-foreground/70">{formatTime(msg.createdAt)}</span>
                                {isTemp && <Loader2 className="h-3 w-3 animate-spin text-primary-foreground/70" />}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2.5 max-w-[85%] sm:max-w-[75%]">
                            {showAvatar ? (
                              <Avatar src={msg.createdByAvatarUrl?.startsWith('media:') ? `/api/media/${msg.createdByAvatarUrl.replace('media:', '')}` : msg.createdByAvatarUrl || undefined} fallback={msg.createdByName?.[0] || '?'} size="sm" className="mt-0.5 shrink-0" />
                            ) : (
                              <div className="w-8 shrink-0" />
                            )}
                            <div className="min-w-0">
                              {!isSameSender && (
                                <p className="text-[11px] font-medium text-primary mb-0.5">{msg.createdByName}</p>
                              )}
                              <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2 text-sm whitespace-pre-wrap">
                                {msg.body && <p className="break-words">{msg.body}</p>}
                                {msg.attachments?.length > 0 && (
                                  <div className="mt-1.5 space-y-1">{msg.attachments.map((a) => renderAttachment(a))}</div>
                                )}
                                <div className="flex items-center gap-1 justify-end mt-0.5">
                                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                                  {isTemp && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
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
                    <button onClick={() => removePendingFile(f.id)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleSend}>
              {canReplyInternal && (
                <div className="flex gap-2 mb-2">
                  <Button type="button" variant={messageType === 'public' ? 'default' : 'outline'} size="sm" onClick={() => setMessageType('public')}>
                    Public Reply
                  </Button>
                  <Button type="button" variant={messageType === 'internal_note' ? 'default' : 'outline'} size="sm" onClick={() => setMessageType('internal_note')}>
                    Internal Note
                  </Button>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={messageType === 'public' ? 'Type a message...' : 'Add an internal note...'}
                    className="pr-10"
                    disabled={sending}
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || sending}
                    className="absolute right-2 bottom-1/2 translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip" className="hidden" onChange={handleFilePick} />
                </div>
                <Button type="submit" disabled={sending || (!newMessage.trim() && pendingFiles.length === 0)} className="shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title || ''}
        message={confirmState?.message || ''}
        variant={confirmState?.variant}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => confirmState?.onConfirm()}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmDialog
        open={!!resultDialog}
        title={resultDialog?.title || ''}
        message={resultDialog?.message || ''}
        variant={resultDialog?.variant}
        confirmLabel="OK"
        alert
        onConfirm={() => setResultDialog(null)}
      />
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
