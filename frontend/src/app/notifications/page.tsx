import { Bell, Mail, MessageCircle, Settings, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock data for notifications
const mockNotifications = [
  {
    id: '1',
    type: 'DOCUMENT_SHARED',
    title: 'New Document Shared',
    message: 'John Doe shared a document with you: "Project Proposal"',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'COMMENT_ADDED',
    title: 'New Comment',
    message: 'Sarah added a comment to your document: "Can you review this section?"',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: '3',
    type: 'DOCUMENT_APPROVED',
    title: 'Document Approved',
    message: 'Your document "Q4 Report" has been approved by the team',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: '4',
    type: 'INVITATION',
    title: 'Team Invitation',
    message: 'You have been invited to join the Marketing team',
    timestamp: '2 days ago',
    read: false,
  },
];

// Notification preferences
const notificationPreferences = [
  { id: 'email', label: 'Email Notifications', enabled: true },
  { id: 'push', label: 'Push Notifications', enabled: true },
  { id: 'mentions', label: 'Mentions', enabled: true },
  { id: 'comments', label: 'Comments', enabled: false },
  { id: 'document_updates', label: 'Document Updates', enabled: true },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Manage your notifications and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notification List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Notifications</h2>
            <Button variant="outline" size="sm">
              Mark all as read
            </Button>
          </div>

          <div className="space-y-3">
            {mockNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:bg-accent/50 transition-colors ${!notification.read ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {!notification.read ? (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${!notification.read ? 'text-blue-700 dark:text-blue-400' : 'text-foreground'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationPreferences.map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pref.label}</p>
                    </div>
                    <div className={`h-6 w-11 rounded-full ${pref.enabled ? 'bg-blue-500' : 'bg-gray-300'} relative`}>
                      <div 
                        className={`bg-white rounded-full h-5 w-5 absolute top-0.5 transition-transform ${pref.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-3">
                <h3 className="font-medium">Notification Channels</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email</span>
                    <Button variant="outline" size="sm" className="text-xs">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push Notifications</span>
                    <Button variant="outline" size="sm" className="text-xs">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Alerts</span>
                    <Button variant="outline" size="sm" className="text-xs">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}