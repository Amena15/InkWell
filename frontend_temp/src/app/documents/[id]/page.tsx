'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, ArrowLeft, FileText, Share2, MoreVertical, Sparkles, Users, Clock } from 'lucide-react';

interface DocumentData {
  id: string;
  title: string;
  content: string;
  lastSaved: string;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData>({
    id,
    title: 'Untitled Document',
    content: '# Welcome to Your New Document\n\nStart writing here...',
    lastSaved: new Date().toISOString(),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState('editor');

  // Update word count when content changes
  useEffect(() => {
    const words = document.content.trim() ? document.content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [document.content]);

  const handleSave = async () => {
    if (!document.title.trim()) {
      toast.error('Please enter a document title');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDocument(prev => ({
        ...prev,
        lastSaved: new Date().toISOString(),
      }));
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
              value={document.title}
              onChange={(e) => setDocument({...document, title: e.target.value})}
              className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0"
              placeholder="Document Title"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {wordCount} words • Last saved {formatLastSaved(document.lastSaved)}
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
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
      <div className="flex-1 overflow-auto p-6">
        <TabsContent value="editor" className="m-0 h-full">
          <div className="max-w-4xl mx-auto h-full">
            <Textarea
              value={document.content}
              onChange={(e) => setDocument({...document, content: e.target.value})}
              className="min-h-[60vh] w-full border-0 text-lg leading-relaxed focus-visible:ring-0 resize-none p-4"
              placeholder="Start writing here..."
            />
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
                    {formatLastSaved(document.lastSaved)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last saved by you
                </p>
              </div>
              {/* Add more version history items here */}
            </div>
          </div>
        </TabsContent>
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
            <div>Auto-save {isSaving ? 'saving...' : 'enabled'}</div>
            <div>Document ID: {id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
