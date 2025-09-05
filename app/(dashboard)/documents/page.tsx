'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function DocumentsPage() {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Documents
          </h1>
          <p className="text-muted-foreground">
            Manage and process your document library
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Management</CardTitle>
            <CardDescription>Upload and organize your documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Document management interface coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}