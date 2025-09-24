import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { documentsAPI } from '@/lib/api-client';
import { useState, useEffect } from 'react';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
}

export function useDocuments() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
  });

  const { mutate: createDocument, isPending: isCreating } = useMutation({
    mutationFn: async ({ title, content = '' }: { title: string; content?: string }) => {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error('Failed to create document');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Success",
        description: "Document created successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateDocument, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update document');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      toast({
        title: "Success",
        description: "Document updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete document');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoadingDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { title: string; content: string; isPublic?: boolean }) => {
      return await documentsAPI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Success",
        description: "Document created successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create document",
        variant: "destructive",
      });
    },
  });
}

export function useDocument(documentId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: document, isLoading, error } = useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      try {
        return await documentsAPI.getById(documentId);
      } catch (err) {
        throw new Error('Failed to fetch document');
      }
    },
    enabled: !!documentId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const { mutate: updateDocument, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      return await documentsAPI.update(id, updates);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      toast({
        title: "Success",
        description: "Document updated successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      return await documentsAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  return {
    document,
    isLoading,
    error,
    updateDocument,
    deleteDocument,
    isUpdating,
    isDeleting,
  };
}
