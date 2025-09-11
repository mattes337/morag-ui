'use client';

import React, { Suspense } from 'react';
import { JobList } from '@/components/jobs/JobList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage processing jobs across all realms
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<JobsLoadingSkeleton />}>
            <JobList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function JobsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter and action bar skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      
      {/* Table header skeleton */}
      <div className="border rounded-lg">
        <div className="border-b p-4">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        
        {/* Table rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="grid grid-cols-12 gap-4 items-center">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-6 w-20 col-span-2" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-4 w-full col-span-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[200px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}