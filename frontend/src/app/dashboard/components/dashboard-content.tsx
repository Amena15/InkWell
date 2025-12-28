'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus, FileText, Users, Clock, FileSearch, Upload, Search } from 'lucide-react';
import documentService from '@/services/document.service';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { DocumentListSkeleton, StatsSkeleton } from '@/components/loading-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface StatItem {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  border: string;
  loading: boolean;
}

/**
 * Dashboard Content Component
 * Displays key metrics and recent activity for the user's documents
 * Includes: document statistics cards, recent document list, and quick actions
 */
export function DashboardContent() {
  const router = useRouter();

  // Fetch recent documents with caching and retry logic
  const {
    data: recentDocuments,
    isLoading: isLoadingRecent,
    isError: isErrorRecent,
    refetch: refetchRecent
  } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: () => documentService.getRecentDocuments(5), // Get 5 most recent documents
    retry: 2,
  });

  // Fetch document statistics with caching and retry logic
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['document-stats'],
    queryFn: () => documentService.getDocumentStats(), // Get user's document statistics
    retry: 2,
  });

  // Handle errors with toast notifications
  if (isErrorRecent) {
    toast.error('Failed to load recent documents');
  }

  if (isErrorStats) {
    toast.error('Failed to load document statistics');
  }

  // Create a new document and navigate to it
  const handleCreateDocument = async () => {
    try {
      const newDoc = await documentService.createDocument({
        title: 'Untitled Document',
        content: '# Welcome to Your New Document\n\nStart writing here...',
        isPublic: false
      });
      router.push(`/documents/${newDoc.id}`);
    } catch (error) {
      toast.error('Failed to create a new document');
    }
  };

  // Retry failed API requests
  const handleRetry = () => {
    if (isErrorRecent) {
      toast.info('Retrying to load recent documents...');
      refetchRecent();
    }
    if (isErrorStats) {
      toast.info('Retrying to load document statistics...');
      refetchStats();
    }
  };

  // Configuration for statistics cards - defines what stats to display
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
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
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

      {/* Combined Documents and Actions Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Documents - takes up 8 columns */}
        <Card className="lg:col-span-8 border border-gray-200 dark:border-gray-800">
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

        {/* Quick Actions - takes up 4 columns */}
        <Card className="lg:col-span-4 border border-gray-200 dark:border-gray-800">
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
