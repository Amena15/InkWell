import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth-options';
import { DocumentEditor } from '@/components/editor/document-editor';

export default async function NewDocumentPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Please sign in to create a document</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <DocumentEditor 
        documentId="new"
        initialContent=""
        initialTitle="Untitled Document"
      />
    </div>
  );
}
