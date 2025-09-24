'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import type { LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
import documentService from '@/services/document.service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { DocumentListSkeleton, StatsSkeleton } from '@/components/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentStats {
  total: number;
  shared: number;
  recentSearches: number;
}

interface StatItem {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  border: string;
  loading: boolean;
}

const RefreshCw = dynamic(() => import('lucide-react').then(mod => mod.RefreshCw));
const Plus = dynamic(() => import('lucide-react').then(mod => mod.Plus));
const FileText = dynamic(() => import('lucide-react').then(mod => mod.FileText));
const Users = dynamic(() => import('lucide-react').then(mod => mod.Users));
const Clock = dynamic(() => import('lucide-react').then(mod => mod.Clock));
const FileSearch = dynamic(() => import('lucide-react').then(mod => mod.FileSearch));
const Upload = dynamic(() => import('lucide-react').then(mod => mod.Upload));
const Search = dynamic(() => import('lucide-react').then(mod => mod.Search));

const RefreshIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <RefreshCw ref={ref} {...props} />
));
RefreshIconComponent.displayName = 'RefreshIcon';

const PlusIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <Plus ref={ref} {...props} />
));
PlusIconComponent.displayName = 'PlusIcon';

const FileTextIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <FileText ref={ref} {...props} />
));
FileTextIconComponent.displayName = 'FileTextIcon';

const UsersIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <Users ref={ref} {...props} />
));
UsersIconComponent.displayName = 'UsersIcon';

const ClockIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <Clock ref={ref} {...props} />
));
ClockIconComponent.displayName = 'ClockIcon';

const FileSearchIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <FileSearch ref={ref} {...props} />
));
FileSearchIconComponent.displayName = 'FileSearchIcon';

const UploadIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <Upload ref={ref} {...props} />
));
UploadIconComponent.displayName = 'UploadIcon';

const SearchIconComponent = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <Search ref={ref} {...props} />
));
SearchIconComponent.displayName = 'SearchIcon';

export function DashboardContent() {
  const router = useRouter();

  // Fetch recent documents
  const { 
    data: recentDocuments, 
    isLoading: isLoadingRecent, 
    isError: isErrorRecent, 
    refetch: refetchRecent 
  } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: () => documentService.getRecentDocuments(5),
    retry: 2,
  });

  // Fetch document stats
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    isError: isErrorStats, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['document-stats'],
    queryFn: documentService.getDocumentStats,
    retry: 2,
  });

  // Handle errors with toast notifications
  if (isErrorRecent) {
    toast({
      title: 'Error',
      description: 'Failed to load recent documents',
      variant: 'destructive',
    });
  }

  if (isErrorStats) {
    toast({
      title: 'Error',
      description: 'Failed to load document statistics',
      variant: 'destructive',
    });
  }

  const handleCreateDocument = async () => {
    try {
      const newDoc = await documentService.createDocument('Untitled Document');
      router.push(`/documents/${newDoc.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create a new document',
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    if (isErrorRecent) refetchRecent();
    if (isErrorStats) refetchStats();
  };

  // Stats configuration with icons and colors
  const statsConfig: StatItem[] = [
    { 
      name: 'Total Documents', 
      value: stats?.total ?? 0,
      icon: FileText as unknown as React.ComponentType<{ className?: string }>,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      loading: isLoadingStats
    },
    { 
      name: 'Shared with Me', 
      value: stats?.shared ?? 0,
      icon: Users as unknown as React.ComponentType<{ className?: string }>,
      color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      loading: isLoadingStats
    },
    { 
      name: 'Recent Activity', 
      value: stats?.recentSearches ?? 0,
      icon: Clock as unknown as React.ComponentType<{ className?: string }>,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      loading: isLoadingStats
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your documents.
          </p>
        </div>
        <div className="flex space-x-2">
          {(isErrorRecent || isErrorStats) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </Button>
          )}
          <Button 
            onClick={handleCreateDocument}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {isErrorStats ? (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-muted-foreground mb-2">Failed to load statistics</p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : isLoadingStats ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.name} 
                className={`border ${stat.border} hover:shadow-md transition-shadow duration-200`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stat.value
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Documents */}
        <Card className="col-span-4 border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Recent Documents
            </CardTitle>
            <CardDescription>
              Your most recently accessed documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
              <DocumentListSkeleton />
            ) : isErrorRecent ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileSearch className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Failed to load recent documents
                </p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try again
                </Button>
              </div>
            ) : recentDocuments?.length ? (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => router.push(`/documents/${doc.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {doc.title || 'Untitled Document'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileSearch className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No recent documents. Create one to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3 border border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quick Actions
              </span>
            </CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-12 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                onClick={handleCreateDocument}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Plus className="h-4 w-4" />
                </div>
                <span>New Document</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-12 text-left hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <Upload className="h-4 w-4" />
                </div>
                <span>Upload Files</span>
                <input type="file" id="file-upload" className="hidden" multiple />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-12 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
                onClick={() => {
                  const searchInput = document.getElementById('global-search');
                  if (searchInput) {
                    searchInput.focus();
                  }
                }}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Search className="h-4 w-4" />
                </div>
                <span>Search Documents</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
