'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthProvider } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import Link from 'next/link';
import type { Project } from '@/types';

function EditProjectContent() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    apiFetch(`/api/projects/${params.id}`)
      .then((d) => {
        const p = d.project as Project;
        setName(p.name);
        setDescription(p.description || '');
      })
      .catch(() => router.push('/portal/projects'))
      .finally(() => setFetching(false));
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, description: description || undefined }),
      });
      router.push('/portal/projects');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="max-w-xl mx-auto space-y-6"><Card><CardContent className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></CardContent></Card></div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/portal/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project details</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Project Name</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                maxLength={500} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" asChild><Link href="/portal/projects">Cancel</Link></Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditProjectPage() {
  return <AuthProvider><EditProjectContent /></AuthProvider>;
}
