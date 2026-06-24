'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

function AdminSettingsContent() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure your support system preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="org-name">Organization Name</label>
            <Input id="org-name" defaultValue="Support Co." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="auto-close">Auto-close tickets after (days)</label>
            <Input id="auto-close" type="number" defaultValue="7" className="max-w-[120px]" />
          </div>
          <Button>
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure how notifications are delivered</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>In-app notifications are enabled by default.</p>
          <p>Email and push notification channels can be configured in Phase 2+.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AuthProvider>
      <AdminSettingsContent />
    </AuthProvider>
  );
}
