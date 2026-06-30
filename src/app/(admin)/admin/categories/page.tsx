'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FolderTree, Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

function AdminCategoriesContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  async function loadCategories() {
    try {
      const data = await apiFetch('/api/categories');
      setCategories(data.categories || []);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const data = await apiFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (data.category) {
        setCategories((prev) => [...prev, data.category]);
        setNewName('');
      }
    } catch {} finally {
      setAdding(false);
    }
  }

  async function handleSave(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const data = await apiFetch(`/api/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (data.category) {
        setCategories((prev) => prev.map((c) => (c.id === id ? data.category : c)));
        setEditingId(null);
      }
    } catch {} finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch {} finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function startEdit(cat: any) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage ticket categories</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New category name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              className="max-w-xs"
            />
            <Button onClick={handleAdd} disabled={adding || !newName.trim()}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Category
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={<FolderTree className="h-12 w-12" />}
              title="No categories"
              description="Create categories to organize tickets."
            />
          ) : (
            <div className="divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FolderTree className="h-4 w-4 text-muted-foreground shrink-0" />
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          ref={editInputRef}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave(cat.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="max-w-xs"
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => handleSave(cat.id)} disabled={saving}>
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">{cat.name}</span>
                    )}
                  </div>
                  {editingId !== cat.id && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(cat)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        variant="destructive"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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
