'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

// Mock data interface
interface Document {
  id: string;
  title: string;
  updatedAt: string;
  type: string;
}

// Mock API client
const api = {
  getStats: async () => ({
    totalDocuments: 24,
    recentDocuments: 12,
  }),
  getRecentDocuments: async (): Promise<{ data: Document[] }> => ({
    data: [
      { id: '1', title: 'Project Proposal', updatedAt: '2 hours ago', type: 'document' },
      { id: '2', title: 'Meeting Notes', updatedAt: '1 day ago', type: 'document' },
      { id: '3', title: 'Team Tasks', updatedAt: '3 days ago', type: 'spreadsheet' },
    ],
  }),
};

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: api.getStats,
  });

  const { data: recentDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['documents', 'recent'],
    queryFn: api.getRecentDocuments,
  });

  const recentDocs = recentDocuments?.data || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, User</h1>
          <p className="text-muted-foreground">Here's what's happening with your documents</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/documents/new">
            <Plus className="h-4 w-4" /> New Document
          </Link>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-accent/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Updates this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Your most recently opened documents</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingDocuments ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                </div>
              ))
            ) : (
              recentDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">Updated {doc.updatedAt}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <Button variant="ghost" className="text-primary">
            View all documents
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
