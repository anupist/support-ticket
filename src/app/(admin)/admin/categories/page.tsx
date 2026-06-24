'use client';

import { useState } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { FolderTree, Plus, X } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'cat_billing', name: 'Billing' },
  { id: 'cat_technical', name: 'Technical Issue' },
  { id: 'cat_account', name: 'Account' },
  { id: 'cat_feature', name: 'Feature Request' },
  { id: 'cat_other', name: 'Other' },
];

function AdminCategoriesContent() {
  const [categories] = useState(DEFAULT_CATEGORIES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage ticket categories</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState
              icon={<FolderTree className="h-12 w-12" />}
              title="No categories"
              description="Create categories to organize tickets."
            />
          ) : (
            <div className="divide-y">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <FolderTree className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <AuthProvider>
      <AdminCategoriesContent />
    </AuthProvider>
  );
}
