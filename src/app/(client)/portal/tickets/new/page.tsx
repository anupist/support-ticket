'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Paperclip, X, Loader2, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import Link from 'next/link';
import type { TicketPriority, TicketAttachment } from '@/types';

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const CATEGORIES = [
  { id: 'cat_billing', name: 'Billing' },
  { id: 'cat_technical', name: 'Technical Issue' },
  { id: 'cat_account', name: 'Account' },
  { id: 'cat_feature', name: 'Feature Request' },
  { id: 'cat_other', name: 'Other' },
];

const FILE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function CreateTicketContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; uploading: boolean; id?: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (pendingFiles.length + files.length > 5) {
      setError('Maximum 5 attachments allowed');
      return;
    }
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds 5MB limit`);
        return;
      }
    }
    setPendingFiles((prev) => [...prev, ...files.map((f) => ({ file: f, uploading: true }))]);
    setUploading(true);
    setError('');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiFetch('/api/media/upload', { method: 'POST', body: formData });
        const { media } = res as { media: { id: string } };
        setPendingFiles((prev) =>
          prev.map((pf) => (pf.file === file && !pf.id ? { ...pf, uploading: false, id: media.id } : pf))
        );
      } catch {
        setError(`Failed to upload "${file.name}"`);
        setPendingFiles((prev) => prev.filter((pf) => pf.file !== file));
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (pendingFiles.some((pf) => pf.uploading)) {
      setError('Please wait for all uploads to finish');
      return;
    }
    setLoading(true);
    try {
      const attachmentIds = pendingFiles.map((pf) => pf.id).filter(Boolean) as string[];
      const data = await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, description, priority, categoryId, attachmentIds }),
      });
      router.push(`/portal/tickets/${(data as any).ticket.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Ticket</h1>
          <p className="text-muted-foreground">Describe your issue and we&apos;ll get back to you</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="subject">Subject</label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                required
                minLength={3}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Describe your issue in detail..."
                required
                minLength={10}
                maxLength={5000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <Button
                      key={p.value}
                      type="button"
                      variant={priority === p.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriority(p.value)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Attachments <span className="text-muted-foreground font-normal">(optional, max 5 files, 5MB each)</span></label>
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((pf, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="max-w-[160px] truncate">{pf.file.name}</span>
                    {pf.uploading ? (
                      <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                    ) : (
                      <button type="button" onClick={() => removePendingFile(i)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {pendingFiles.length < 5 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50">
                    <Paperclip className="h-3 w-3" />
                    Add files
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" multiple accept={FILE_TYPES.join(',')} className="hidden" onChange={handleFilePick} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/portal/tickets">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <AuthProvider>
      <CreateTicketContent />
    </AuthProvider>
  );
}
