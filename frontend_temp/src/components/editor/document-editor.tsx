'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface DocumentEditorProps {
  documentId?: string;
  initialContent?: string;
  initialTitle?: string;
}

export function DocumentEditor({ 
  documentId, 
  initialContent = '', 
  initialTitle = 'Untitled Document' 
}: DocumentEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [debouncedContent] = useDebounce(content, 1000);
  const lastSavedRef = useRef<string | null>(null);

  // Fetch document if documentId is provided
  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => documentId ? documentService.getDocumentById(documentId) : null,
    enabled: !!documentId,
  });

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      lastSavedRef.current = document.content;
    }
  }, [document]);

  // Auto-save functionality
  const { mutate: saveDocument } = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      if (documentId) {
        return documentService.updateDocument(documentId, { title, content });
      } else {
        const newDoc = await documentService.createDocument(title, content);
        router.push(`/documents/${newDoc.id}`);
        return newDoc;
      }
    },
    onSuccess: () => {
      lastSavedRef.current = content;
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
      toast({
        title: 'Document saved',
        description: 'Your changes have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save document',
        variant: 'destructive',
      });
    },
  });

  // Auto-save when content changes
  useEffect(() => {
    if (debouncedContent && debouncedContent !== lastSavedRef.current) {
      saveDocument({ title, content: debouncedContent });
    }
  }, [debouncedContent, title, saveDocument]);

  // Handle manual save
  const handleSave = useCallback(() => {
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

  if (isLoading) {
    return <div>Loading document...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Document Title"
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0"
        />
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <MDXEditor
          key={documentId || 'new-doc'}
          markdown={content}
          onChange={handleContentChange}
          plugins={loadedPlugins}
          contentEditableClassName="prose max-w-none min-h-[500px] p-4"
        />
      </div>
    </div>
  );
}
