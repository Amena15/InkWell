import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Helper function to convert tags array to JSON string for storage
const tagsArrayToString = (tags: string[] | undefined): string => {
  if (!tags || !Array.isArray(tags)) {
    return '[]';
  }
  return JSON.stringify(tags);
};

// Helper function to convert tags JSON string to array for response
const tagsStringToArray = (tagsString: string): string[] => {
  try {
    return JSON.parse(tagsString || '[]');
  } catch (error) {
    console.error('Error parsing tags:', error);
    return [];
  }
};

// Handle document updates by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const documentId = params.id;

    if (!documentId) {
      return new NextResponse('Document ID is required', { status: 400 });
    }

    const { title, content, isPublic, tags, folderId } = await request.json();

    // Check if the document belongs to the user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!existingDocument) {
      return new NextResponse('Document not found or unauthorized', { status: 404 });
    }

    // Calculate word count if content is being updated
    const newContent = content !== undefined ? content : existingDocument.content;
    const wordCount = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;

    // Update document in the database
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        title: title !== undefined ? title : existingDocument.title,
        content: newContent,
        isPublic: isPublic !== undefined ? isPublic : existingDocument.isPublic,
        tags: tags !== undefined ? tagsArrayToString(tags) : existingDocument.tags,
        folderId: folderId !== undefined ? folderId : existingDocument.folderId,
        wordCount, // Update the word count
        updatedAt: new Date(),
      },
    });

    // Convert tags for the response
    const responseDocument = {
      ...updatedDocument,
      tags: tagsStringToArray(updatedDocument.tags),
    };

    return NextResponse.json(responseDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle document deletion by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const documentId = params.id;

    if (!documentId) {
      return new NextResponse('Document ID is required', { status: 400 });
    }

    // Check if the document belongs to the user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });

    if (!existingDocument) {
      return new NextResponse('Document not found or unauthorized', { status: 404 });
    }

    // Delete document from the database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handle document fetching by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const documentId = params.id;

    if (!documentId) {
      return new NextResponse('Document ID is required', { status: 400 });
    }

    // Check if the document belongs to the user or is public
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { userId: session.user.id },
          { isPublic: true }
        ]
      },
    });

    if (!document) {
      return new NextResponse('Document not found or unauthorized', { status: 404 });
    }

    // Convert tags for the response
    const responseDocument = {
      ...document,
      tags: tagsStringToArray(document.tags),
    };

    return NextResponse.json(responseDocument);
  } catch (error) {
    console.error('Error fetching document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}