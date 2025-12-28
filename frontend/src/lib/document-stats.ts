import { prisma } from '@/lib/prisma';

export async function getDocumentStats(userId: string) {
  try {
    // Get total documents count
    const total = await prisma.document.count({
      where: {
        userId: userId,
      },
    });

    // Get shared documents count (documents with isPublic = true)
    const shared = await prisma.document.count({
      where: {
        userId: userId,
        isPublic: true,
      },
    });

    // Get recent document activity
    const recentActivity = await prisma.document.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    // Get total storage used (approximate based on content length)
    const documents = await prisma.document.findMany({
      where: {
        userId: userId,
      },
      select: {
        content: true,
      },
    });

    const totalStorageUsed = documents.reduce((sum, doc) => sum + (doc.content ? doc.content.length : 0), 0);

    // Group documents by a simple heuristic - we'll count documents by their content characteristics
    const documentsByType = [
      {
        type: 'Markdown',
        count: documents.filter(doc => doc.content.includes('# ') || doc.content.includes('## ')).length,
      },
      {
        type: 'Plain Text',
        count: documents.filter(doc => !doc.content.includes('# ') && !doc.content.includes('**') && !doc.content.includes('*')).length,
      },
      {
        type: 'Rich Text',
        count: documents.filter(doc => doc.content.includes('**') || doc.content.includes('*')).length,
      },
    ];

    return {
      total,
      shared,
      recentSearches: recentActivity.length,
      lastUpdated: recentActivity.length > 0 ? recentActivity[0].updatedAt.toISOString() : new Date().toISOString(),
      storageUsed: totalStorageUsed,
      documentsByType,
    };
  } catch (error) {
    console.error('Error fetching document stats:', error);
    throw error;
  }
}