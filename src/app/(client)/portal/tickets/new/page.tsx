'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import Link from 'next/link';
import type { TicketPriority } from '@/types';

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

function CreateTicketContent() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject, description, priority, categoryId }),
      });

      router.push(`/portal/tickets/${data.ticket.id}`);
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

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/portal/tickets">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                <Send className="h-4 w-4" />
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
