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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, User</h1>
          <p className="text-gray-600">Here's what's happening with your documents</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.totalDocuments || 0}</div>
              <p className="text-xs text-green-600">+5 from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats?.recentDocuments || 0}</div>
              <p className="text-xs text-green-600">Updates this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Your most recently opened documents</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
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
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                ))
              ) : (
                recentDocs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">Updated {doc.updatedAt}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-200 px-6 py-3">
            <Link href="/documents">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View all documents
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
