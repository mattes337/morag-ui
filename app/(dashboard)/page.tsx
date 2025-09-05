'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function DashboardPage() {
  return (
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

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Documents Card */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Manage your document library</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">147</div>
              <p className="text-sm text-muted-foreground">
                Total documents processed
              </p>
            </CardContent>
          </Card>

          {/* Processing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Processing</CardTitle>
              <CardDescription>Active processing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">
                Jobs currently running
              </p>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>System insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-sm text-muted-foreground">
                Processing success rate
              </p>
            </CardContent>
          </Card>
        </div>

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
  );
}