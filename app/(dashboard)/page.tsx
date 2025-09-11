'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AnalyticsProvider } from '@/lib/contexts/AnalyticsContext';

export default function DashboardPage() {
  return (
    <AnalyticsProvider>
      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Dashboard Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome to MoRAG - Modular Retrieval-Augmented Generation Platform
            </p>
          </div>

          {/* Integrated Analytics Dashboard Grid */}
          <DashboardGrid />

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Document processed successfully</p>
                    <p className="text-xs text-muted-foreground">research-paper.pdf - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New realm created</p>
                    <p className="text-xs text-muted-foreground">Marketing Team Workspace - 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Processing pipeline updated</p>
                    <p className="text-xs text-muted-foreground">Engineering Docs realm - 3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AnalyticsProvider>
  );
}