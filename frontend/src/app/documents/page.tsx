'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileCode,
  MoreHorizontal,
  Grid3X3,
  List,
  Filter,
  Folder,
  Star,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Mock data for documents
  const documents = [
    { id: '1', title: 'Project Proposal', type: 'document', updatedAt: '2 hours ago', starred: true },
    { id: '2', title: 'Meeting Notes', type: 'document', updatedAt: '1 day ago', starred: false },
    { id: '3', title: 'Team Tasks', type: 'spreadsheet', updatedAt: '3 days ago', starred: true },
    { id: '4', title: 'Design Mockup', type: 'image', updatedAt: '1 week ago', starred: false },
    { id: '5', title: 'API Documentation', type: 'document', updatedAt: '2 days ago', starred: false },
    { id: '6', title: 'Code Snippets', type: 'code', updatedAt: '5 days ago', starred: true },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-5 w-5 text-purple-600" />;
      case 'code': return <FileCode className="h-5 w-5 text-green-600" />;
      case 'video': return <FileVideo className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage all your documents in one place</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
            <Button variant="outline" className="border-gray-300 text-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('grid')}
              className="border-gray-300"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'outline'} 
              size="icon"
              onClick={() => setViewMode('list')}
              className="border-gray-300"
            >
              <List className="h-4 w-4" />
            </Button>
            <Link href="/documents/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
            </Link>
          </div>
        </div>

        {/* Folders Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-gray-200 hover:border-blue-300">
              <CardContent className="p-4 flex items-center">
                <Folder className="h-10 w-10 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Projects</h3>
                  <p className="text-sm text-gray-500">12 documents</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-gray-200 hover:border-blue-300">
              <CardContent className="p-4 flex items-center">
                <Folder className="h-10 w-10 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Meetings</h3>
                  <p className="text-sm text-gray-500">8 documents</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-gray-200 hover:border-blue-300">
              <CardContent className="p-4 flex items-center">
                <Folder className="h-10 w-10 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Personal</h3>
                  <p className="text-sm text-gray-500">5 documents</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400">
              <CardContent className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <Plus className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-500">New Folder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">All Documents</h2>
            <div className="text-sm text-gray-500">
              {documents.length} documents
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getIconForType(doc.type)}
                        <h3 className="font-medium text-gray-900 ml-2 truncate max-w-[150px]">{doc.title}</h3>
                      </div>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    {doc.starred && (
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-500 ml-1">Starred</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{doc.updatedAt}</span>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                          <Star className={`h-4 w-4 ${doc.starred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        {getIconForType(doc.type)}
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{doc.title}</div>
                          <div className="text-sm text-gray-500">{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • Updated {doc.updatedAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.starred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}