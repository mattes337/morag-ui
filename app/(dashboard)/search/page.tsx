'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function SearchPage() {
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Search
          </h1>
          <p className="text-muted-foreground">
            Search across your documents and knowledge base
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semantic Search</CardTitle>
            <CardDescription>AI-powered document search and retrieval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced search interface coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}