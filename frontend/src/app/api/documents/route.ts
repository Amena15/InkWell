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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch documents from the database
    const rawDocuments = await prisma.document.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Convert tags from JSON string to array for the response
    const documents = rawDocuments.map(doc => ({
      ...doc,
      tags: tagsStringToArray(doc.tags),
    }));

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, content, isPublic = false, tags = [], folderId } = await request.json();

    if (!title || !content) {
      return new NextResponse('Title and content are required', { status: 400 });
    }

    // Calculate word count
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    // Create document in the database
    const newDocument = await prisma.document.create({
      data: {
        title,
        content,
        isPublic,
        tags: tagsArrayToString(tags),
        folderId,
        userId: session.user.id,
        wordCount, // Store the calculated word count
      },
    });

    // Convert tags for the response
    const responseDocument = {
      ...newDocument,
      tags: tagsStringToArray(newDocument.tags),
    };

    return NextResponse.json(responseDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
