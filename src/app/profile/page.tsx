'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const setUserStore = useAuthStore((s) => s.setUser);
  const storeUser = useAuthStore((s) => s.user);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((data) => {
        const u = data.user;
        setDisplayName(u.displayName || '');
        const url = u.avatarURL || u.avatarUrl || '';
        setAvatarUrl(url);
        if (url) setAvatarPreview(url.startsWith('media:') ? `/api/media/${url.replace('media:', '')}` : url);
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.media) {
        const mediaRef = `media:${data.media.id}`;
        setAvatarUrl(mediaRef);
        setAvatarPreview(data.media.url);
        setError('');
      }
    } catch {
      setError('Failed to upload image');
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to update profile');
      }

      if (storeUser) {
        setUserStore({ ...storeUser, displayName, avatarUrl });
      }
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-lg mx-auto py-12 px-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>Edit your display name and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar src={avatarPreview || undefined} fallback={displayName || 'U'} size="lg" />
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="h-5 w-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium">{displayName || 'Your Name'}</p>
                <p className="text-xs text-muted-foreground">Click to upload a new photo</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}