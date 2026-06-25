'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { Users, Plus, X, Loader2 } from 'lucide-react';

function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('agent');
  const [formCustomRoleId, setFormCustomRoleId] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/admin/roles').then((r) => r.json()).catch(() => ({ roles: [] })),
    ]).then(([userData, roleData]) => {
      setUsers(userData.users || []);
      setCustomRoles(roleData.roles || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);

    try {
      const body: any = { email: formEmail, displayName: formName, role: formRole };
      if (formCustomRoleId) body.customRoleId = formCustomRoleId;

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create user');
      }

      setShowModal(false);
      setFormEmail('');
      setFormName('');
      setFormRole('agent');
      setFormCustomRoleId('');
      loadUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage support agents and clients</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-16 w-full" />))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users className="h-12 w-12" />} title="No users yet" description="Users will appear here once they register." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center gap-4 p-4">
                  <Avatar fallback={user.displayName?.[0] || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'agent' ? 'info' : user.role === 'super_admin' ? 'warning' : 'secondary'}>
                    {user.role}
                  </Badge>
                  {!user.isActive && <Badge variant="destructive">Inactive</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Invite User</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role / Permission Set</label>
                <select value={formCustomRoleId || formRole} onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('custom:')) {
                    setFormCustomRoleId(val.replace('custom:', ''));
                    setFormRole('agent');
                  } else {
                    setFormCustomRoleId('');
                    setFormRole(val);
                  }
                }} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <optgroup label="Built-in Roles">
                    <option value="client">Client</option>
                    <option value="agent">Agent</option>
                    <option value="super_admin">Super Admin</option>
                  </optgroup>
                  {customRoles.length > 0 && (
                    <optgroup label="Custom Roles">
                      {customRoles.map((r: any) => (
                        <option key={r.id} value={`custom:${r.id}`}>
                          {r.name} ({r.permissions.length} permissions)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <Button type="submit" disabled={formSaving} className="w-full">
                {formSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {formSaving ? 'Creating...' : 'Create & Send Invitation'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AuthProvider>
      <AdminUsersContent />
    </AuthProvider>
  );
}