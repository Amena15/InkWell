'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Search, Plus, Clock, FolderOpen, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import documentService from '@/services/document.service';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DocumentCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  onClick: () => void;
}

function DocumentCard({ id, title, content, updatedAt, onClick }: DocumentCardProps) {
  // Extract first line of content as preview
  const preview = content.split('\n')[0].substring(0, 100) + '...';

  return (
    <Card 
      className="hover:shadow-md cursor-pointer transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="truncate max-w-[70%]">{title}</span>
          <Badge variant="outline" className="text-xs">
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-1" />
          Updated {new Date(updatedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {preview}
        </p>
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <FileText className="h-3 w-3 mr-1" />
          {/* Simple word count */}
          {content.trim() ? content.trim().split(/\s+/).length : 0} words
        </div>
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    data: documents, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['documents'],
    queryFn: documentService.getDocuments,
    retry: 2,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreateNewDocument = async () => {
    try {
      const newDoc = await documentService.createDocument({
        title: 'Untitled Document',
        content: '# Welcome to Your New Document\n\nStart writing here...',
      });
      router.push(`/documents/${newDoc.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  // Handle document upload
  const handleUploadDocument = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt,.md,.doc,.docx,.pdf'; // Accept common document formats

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;

      try {
        // Preview file contents (for text-based files)
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;

          // Create document from file content
          const newDoc = await documentService.createDocument({
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension from filename
            content: content || `# ${file.name}\n\nContent from uploaded file.`,
          });

          // Navigate to the new document
          router.push(`/documents/${newDoc.id}`);
          toast.success('Document uploaded successfully!');
        };

        // For text-based files, read as text; for others, show generic message
        if (file.type.startsWith('text/') ||
            file.name.endsWith('.md') ||
            file.name.endsWith('.txt')) {
          reader.readAsText(file);
        } else {
          // For non-text files, create a basic document and handle differently
          const newDoc = await documentService.createDocument({
            title: file.name.replace(/\.[^/.]+$/, ""),
            content: `# ${file.name}\n\nThis document was uploaded. Content processing pending.`,
          });

          router.push(`/documents/${newDoc.id}`);
          toast.success('Document uploaded successfully!');
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        toast.error('Failed to upload document');
      }
    };

    fileInput.click();
  };

  // Filter documents based on search term
  const filteredDocuments = documents?.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Your documents and files
            </p>
          </div>
          <Button onClick={handleCreateNewDocument}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load documents</h3>
          <p className="text-muted-foreground mb-4">There was an error loading your documents</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Your documents and files
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUploadDocument}>
            <FileText className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button onClick={handleCreateNewDocument}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-3/4" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-1/2" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments && filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              content={doc.content}
              updatedAt={doc.updatedAt}
              onClick={() => router.push(`/documents/${doc.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? `No documents match "${searchTerm}"` 
              : 'Get started by creating your first document'}
          </p>
          <Button onClick={handleCreateNewDocument}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Document
          </Button>
        </div>
      )}
    </div>
  );
}