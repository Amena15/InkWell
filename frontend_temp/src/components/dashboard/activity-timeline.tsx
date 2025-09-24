'use client';

import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from './user-avatar';

type Activity = {
  id: string;
  type: 'created' | 'updated' | 'published' | 'commented';
  documentTitle: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
};

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'created':
      return '🆕';
    case 'updated':
      return '✏️';
    case 'published':
      return '📢';
    case 'commented':
      return '💬';
    default:
      return '🔹';
  }
};

const getActivityText = (activity: Activity) => {
  const { type, documentTitle, user } = activity;
  const userName = user?.name || 'Someone';
  
  switch (type) {
    case 'created':
      return `${userName} created a new document`;
    case 'updated':
      return `${userName} updated the document`;
    case 'published':
      return `${userName} published the document`;
    case 'commented':
      return `${userName} commented on the document`;
    default:
      return 'Activity occurred';
  }
};

export function ActivityTimeline({ activities, loading = false }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No recent activity to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <UserAvatar 
            name={activity.user.name} 
            avatar={activity.user.avatar} 
            className="h-8 w-8"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {getActivityText(activity)}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.documentTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
