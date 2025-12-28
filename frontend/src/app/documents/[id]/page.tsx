'use client';

import { DocumentEditor } from '@/components/editor/document-editor';

export default function DocumentPage({ params }: { params: { id: string } }) {
  return (
    <DocumentEditor documentId={params.id} />
  );
}
