'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

type Document = {
  id: string;
  title: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
};

interface DocumentStatsProps {
  documents: Document[];
  loading?: boolean;
}

export function DocumentStats({ documents, loading = false }: DocumentStatsProps) {
  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  // Group documents by status
  const statusData = [
    { name: 'Draft', count: documents.filter(doc => doc.status === 'draft').length },
    { name: 'Published', count: documents.filter(doc => doc.status === 'published').length },
    { name: 'Archived', count: documents.filter(doc => doc.status === 'archived').length },
  ];

  // Get top 5 most viewed documents
  const topDocuments = [...documents]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={statusData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Documents" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
