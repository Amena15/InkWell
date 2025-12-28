'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, FileText, Share2, Users, Clock, Sparkles } from 'lucide-react';
import documentService from '@/services/document.service';
import dynamic from 'next/dynamic';

// Dynamically import the MDX editor to avoid SSR issues
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

// Import the editor plugins
type Plugin = () => Promise<any>;

const plugins: Plugin[] = [
  () => import('@mdxeditor/editor').then((mod) => mod.headingsPlugin()),
  () => import('@mdxeditor/editor').then((mod) => mod.listsPlugin()),
  () => import('@mdxeditor/editor').then((mod) => mod.quotePlugin()),
  () => import('@mdxeditor/editor').then((mod) => mod.thematicBreakPlugin()),
  () => import('@mdxeditor/editor').then((mod) => mod.markdownShortcutPlugin()),
];

export interface DocumentEditorProps {
  documentId?: string;
  initialContent?: string;
  initialTitle?: string;
}

/**
 * Document Editor Component
 * Provides a rich text editor interface for creating and editing documents
 * Features include auto-save, word count, tabs for different views, and real-time updates
 */
export function DocumentEditor({
  documentId,
  initialContent = '',
  initialTitle = 'Untitled Document'
}: DocumentEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [debouncedContent] = useDebounce(content, 1000); // Auto-save after 1 second of inactivity
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState('editor');
  const lastSavedRef = useRef<string | null>(null); // Keeps track of last saved content to detect changes
  const lastSavedTimeRef = useRef<Date>(new Date()); // Track last save time

  // Fetch document from database if editing an existing document
  const { data: document, isLoading, isError } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => documentId ? documentService.getDocumentById(documentId) : null,
    enabled: !!documentId,
  });

  // Update document data when it's loaded from the API
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      lastSavedRef.current = document.content;
      lastSavedTimeRef.current = new Date(document.updatedAt);
    }
  }, [document]);

  // Update word count when content changes
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [content]);

  // Mutation hook for saving documents to the database
  const { mutate: saveDocument, isPending: isSavingMutation } = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      // If documentId exists, update the existing document, otherwise create a new one
      if (documentId) {
        return documentService.updateDocument(documentId, { title, content });
      } else {
        const newDoc = await documentService.createDocument({
          title,
          content,
          isPublic: false // Default to private for new documents
        });
        // Redirect to the newly created document page
        router.push(`/documents/${newDoc.id}`);
        return newDoc;
      }
    },
    onMutate: () => {
      // Show saving indicator
      setIsSaving(true);
    },
    onSuccess: (savedDoc) => {
      // Update references with saved data
      lastSavedRef.current = savedDoc.content;
      lastSavedTimeRef.current = new Date(savedDoc.updatedAt);
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      // Show success notification
      toast.success('Document saved successfully');
    },
    onError: (error) => {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    },
    onSettled: () => {
      // Hide saving indicator
      setIsSaving(false);
    },
  });

  // Auto-save functionality: save document when content changes after debounce period
  useEffect(() => {
    if (debouncedContent && debouncedContent !== lastSavedRef.current && documentId) {
      saveDocument({ title, content: debouncedContent });
    }
  }, [debouncedContent, title, saveDocument, documentId]);

  // Handle manual save
  const handleSave = useCallback(() => {
    if (!title.trim()) {
      toast.error('Please enter a document title');
      return;
    }
    saveDocument({ title, content });
  }, [title, content, saveDocument]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // Load plugins
  const [loadedPlugins, setLoadedPlugins] = useState<any[]>([]);

  useEffect(() => {
    const loadPlugins = async () => {
      const loaded = await Promise.all(plugins.map(plugin => plugin()));
      setLoadedPlugins(loaded);
    };
    loadPlugins();
  }, []);

  if (isError) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="p-4 border-b">
          <div className="max-w-7xl mx-auto">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Document not found</h2>
            <p className="text-muted-foreground mb-4">The document you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => router.push('/documents')}>Go to Documents</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="p-4 border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-10 w-20 bg-muted rounded"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-48 bg-muted rounded mx-auto mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-4/6 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              value={title}
              onChange={handleTitleChange}
              className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0"
              placeholder="Document Title"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {wordCount} words • Last saved {formatLastSaved(lastSavedTimeRef.current)}
            </div>
            <Button onClick={handleSave} disabled={isSaving || isSavingMutation}>
              {isSaving || isSavingMutation ? 'Saving...' : 'Save'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList>
            <TabsTrigger value="editor">
              <FileText className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="collaboration">
              <Users className="h-4 w-4 mr-2" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Version History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsContent value="editor" className="m-0 h-full">
            <div className="p-4">
              <div className="max-w-4xl mx-auto">
                <MDXEditor
                  key={documentId || 'new-doc'}
                  markdown={content}
                  onChange={handleContentChange}
                  plugins={loadedPlugins}
                  contentEditableClassName="prose max-w-none min-h-[500px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="m-0 p-6">
            <div className="max-w-2xl mx-auto text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Collaborate with your team</h3>
              <p className="text-muted-foreground mb-6">
                Invite team members to view or edit this document. Changes will appear in real-time.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button className="w-full sm:w-auto">
                  <Users className="mr-2 h-4 w-4" />
                  Invite Team
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="m-0 p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Version History</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Current Version</span>
                    <span className="text-sm text-muted-foreground">
                      {formatLastSaved(lastSavedTimeRef.current)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last saved by you
                  </p>
                </div>
                {/* In a real implementation, you would fetch and display actual version history */}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Panel */}
      <div className="border-t p-4 bg-muted/20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Assistant</span>
            </Button>
            <span className="text-sm text-muted-foreground hidden md:inline">
              Ask AI to help improve your writing
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-center sm:text-right">
            <div>Auto-save {isSaving || isSavingMutation ? 'saving...' : 'enabled'}</div>
            <div>Document ID: {documentId || 'new'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
