import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';

interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock database (replace with your actual database calls)
let documents: Document[] = [];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userDocuments = documents.filter(doc => doc.userId === session.user.id);
    return NextResponse.json(userDocuments);
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

    const { title, content } = await request.json();
    
    if (!title || !content) {
      return new NextResponse('Title and content are required', { status: 400 });
    }

    const newDocument: Document = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    documents.push(newDocument);
    
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
