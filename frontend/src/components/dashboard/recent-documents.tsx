'use client';

import { format } from 'date-fns';
import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getStatusConfig, formatDate } from '@/lib/document-utils';
import { cn } from '@/lib/utils';
import React from 'react';

type Document = {
  id: string;
  title: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
};

interface RecentDocumentsProps {
  documents: Document[];
  loading?: boolean;
}

export function RecentDocuments({ documents, loading = false }: RecentDocumentsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center space-y-2 text-center">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No documents yet</p>
        <Button variant="outline" size="sm" className="mt-2">
          Create your first document
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div key={document.id} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="rounded-md bg-primary/10 p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <Link 
                href={`/documents/${document.id}`}
                className="text-sm font-medium leading-none hover:underline"
              >
                {document.title}
              </Link>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <p className="text-sm text-muted-foreground">
                  {formatDate(document.updatedAt)}
                </p>
                <span className="mx-2">•</span>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'flex items-center space-x-1.5 rounded-full px-2 py-0.5 text-xs',
                    getStatusConfig(document.status).bgColor,
                    getStatusConfig(document.status).color
                  )}>
                    {React.createElement(getStatusConfig(document.status).icon, { className: 'h-3 w-3' })}
                    <span>{getStatusConfig(document.status).label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Eye className="mr-1 h-4 w-4" />
            <span>{document.views.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
