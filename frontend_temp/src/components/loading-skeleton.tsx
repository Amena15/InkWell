'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DocumentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DocumentEditorSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {Array(10).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" style={{
              width: `${Math.random() * 40 + 60}%`,
              opacity: 1 - (i * 0.05)
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
