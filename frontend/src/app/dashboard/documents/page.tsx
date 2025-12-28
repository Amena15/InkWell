'use client';

import { useState } from 'react';
import { FileText, Folder, Star, Search, Grid, List, Plus, MoreVertical, Clock, Users, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Document = {
  id: string;
  title: string;
  updatedAt: string;
  isStarred: boolean;
  type: 'document' | 'spreadsheet' | 'presentation';
  sharedWith?: number;
};

type FolderType = {
  id: string;
  name: string;
  documentCount: number;
  icon: React.ReactNode;
};

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual data from your API
  const folders: FolderType[] = [
    { id: '1', name: 'Projects', documentCount: 12, icon: <Folder className="h-5 w-5 text-blue-500" /> },
    { id: '2', name: 'Meetings', documentCount: 8, icon: <Folder className="h-5 w-5 text-green-500" /> },
    { id: '3', name: 'Personal', documentCount: 5, icon: <Folder className="h-5 w-5 text-yellow-500" /> },
  ];

  const documents: Document[] = [
    { 
      id: '1', 
      title: 'Project Proposal', 
      updatedAt: '2025-12-28T10:30:00Z', 
      isStarred: true, 
      type: 'document',
      sharedWith: 3
    },
    { 
      id: '2', 
      title: 'Meeting Notes', 
      updatedAt: '2025-12-27T14:20:00Z', 
      isStarred: false, 
      type: 'document'
    },
    { 
      id: '3', 
      title: 'Team Tasks', 
      updatedAt: '2025-12-25T09:15:00Z', 
      isStarred: true, 
      type: 'spreadsheet',
      sharedWith: 5
    },
    { 
      id: '4', 
      title: 'Design Mockup', 
      updatedAt: '2025-12-20T16:45:00Z', 
      isStarred: false, 
      type: 'document'
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage all your documents in one place
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
            <Grid className={`h-4 w-4 ${viewMode === 'grid' ? 'text-primary' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
            <List className={`h-4 w-4 ${viewMode === 'list' ? 'text-primary' : ''}`} />
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="shared">Shared with me</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Folders</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {folders.map((folder) => (
                <Card key={folder.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-accent">
                        {folder.icon}
                      </div>
                      <div>
                        <p className="font-medium">{folder.name}</p>
                        <p className="text-sm text-muted-foreground">{folder.documentCount} documents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors">
                <CardContent className="p-4 h-full flex items-center justify-center">
                  <Button variant="ghost" className="flex flex-col items-center justify-center h-full w-full">
                    <Plus className="h-6 w-6 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">New Folder</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">All Documents</h3>
              <p className="text-sm text-muted-foreground">{documents.length} documents</p>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="group cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <FileText className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(doc.updatedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Star className={`h-4 w-4 ${doc.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuItem>Rename</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {doc.sharedWith && (
                        <div className="mt-3 flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>Shared with {doc.sharedWith} people</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <Card key={doc.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <FileText className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Updated {formatDate(doc.updatedAt)}</span>
                              {doc.sharedWith && (
                                <>
                                  <span className="mx-2">•</span>
                                  <Users className="h-3 w-3 mr-1" />
                                  <span>Shared with {doc.sharedWith} people</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Star className={`h-4 w-4 ${doc.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuItem>Rename</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
