'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { Users, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';

function AdminUsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage support agents and clients</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No users yet"
          description="Users will appear here once they register."
        />
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
                  {!user.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
