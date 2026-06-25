'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { Shield, Plus, X, Loader2, Trash2 } from 'lucide-react';

const ALL_PERMISSIONS = [
  'ticket.create', 'ticket.view', 'ticket.list',
  'ticket.update_status', 'ticket.assign', 'ticket.close', 'ticket.reopen', 'ticket.delete',
  'message.create', 'message.reply_public', 'message.reply_internal', 'message.view_internal',
  'user.manage', 'user.list', 'dashboard.view', 'category.manage', 'settings.view',
];

function AdminRolesContent() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPerms, setFormPerms] = useState<Set<string>>(new Set(['ticket.view', 'ticket.list', 'message.reply_public']));
  const [formSaving, setFormSaving] = useState(false);

  const loadRoles = () => {
    setLoading(true);
    fetch('/api/admin/roles').then((r) => r.json()).then((data) => {
      setRoles(data.roles || []); setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadRoles(); }, []);

  function togglePerm(p: string) {
    setFormPerms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormSaving(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, permissions: Array.from(formPerms) }),
      });
      if (!res.ok) return;
      setShowCreate(false);
      setFormName('');
      setFormPerms(new Set(['ticket.view', 'ticket.list']));
      loadRoles();
    } finally { setFormSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this role? Users assigned to it will lose custom permissions.')) return;
    await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
    loadRoles();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Create and manage custom roles</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create Role</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => (<Skeleton key={i} className="h-24 w-full" />))}</div>
      ) : roles.length === 0 ? (
        <EmptyState icon={<Shield className="h-12 w-12" />} title="No custom roles" description="Create roles to define custom permission sets for your users." />
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{role.userCount} user(s) assigned</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {(role.permissions as string[]).map((p: string) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card">
              <h2 className="text-lg font-semibold">Create Role</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Name</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Support Manager" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                  {ALL_PERMISSIONS.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded px-2 py-1">
                      <input type="checkbox" checked={formPerms.has(p)} onChange={() => togglePerm(p)} className="rounded" />
                      <span className="text-xs">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" disabled={formSaving} className="w-full">
                {formSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {formSaving ? 'Creating...' : 'Create Role'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRolesPage() {
  return (
    <AuthProvider>
      <AdminRolesContent />
    </AuthProvider>
  );
}