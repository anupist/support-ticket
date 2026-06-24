'use client';

import { useState, useEffect, use } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { ROLES } from '@/lib/constants';

function AdminUserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUserData(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/admin/users">Back to Users</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar fallback={userData.displayName?.[0] || '?'} size="lg" />
            <div>
              <h2 className="text-xl font-bold">{userData.displayName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={userData.role === 'agent' ? 'info' : userData.role === 'super_admin' ? 'warning' : 'secondary'}>
                  {userData.role}
                </Badge>
                {!userData.isActive && <Badge variant="destructive">Inactive</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {userData.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(userData.createdAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {ROLES.map((role) => (
              <Button
                key={role}
                variant={userData.role === role ? 'default' : 'outline'}
                size="sm"
                onClick={async () => {
                  const res = await fetch(`/api/users/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role }),
                  });
                  if (res.ok) {
                    setUserData((prev: any) => ({ ...prev, role }));
                  }
                }}
              >
                {role.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthProvider>
      <AdminUserDetailContent params={params} />
    </AuthProvider>
  );
}
