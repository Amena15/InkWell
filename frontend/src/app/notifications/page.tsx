'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Document Shared',
      message: 'Sarah Johnson shared "Q3 Report" with you',
      time: '2 minutes ago',
      type: 'info',
      icon: <Mail className="h-5 w-5 text-blue-600" />,
      read: false,
    },
    {
      id: 2,
      title: 'Document Updated',
      message: 'Your document "Project Proposal" has been updated',
      time: '1 hour ago',
      type: 'success',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      read: false,
    },
    {
      id: 3,
      title: 'Comment Added',
      message: 'Michael added a comment to "Marketing Plan"',
      time: '3 hours ago',
      type: 'info',
      icon: <Mail className="h-5 w-5 text-blue-600" />,
      read: true,
    },
    {
      id: 4,
      title: 'Invitation Received',
      message: 'You have been invited to collaborate on "Budget Analysis"',
      time: '5 hours ago',
      type: 'success',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      read: true,
    },
    {
      id: 5,
      title: 'Reminder',
      message: 'Your document "Research Paper" is due tomorrow',
      time: '1 day ago',
      type: 'warning',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      read: true,
    },
  ];

  const notificationStats = [
    { name: 'Unread', count: 2, color: 'bg-blue-100 text-blue-800' },
    { name: 'Today', count: 3, color: 'bg-green-100 text-green-800' },
    { name: 'This Week', count: 5, color: 'bg-purple-100 text-purple-800' },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Mail className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with all your document activities</p>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {notificationStats.map((stat, index) => (
            <Card key={index} className="bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.color} mb-2`}>
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">{stat.count}</h3>
                <p className="text-gray-600">{stat.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notifications List */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start p-4 rounded-lg border ${
                    !notification.read 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="mr-3 mt-0.5">
                    {getIconForType(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${!notification.read ? 'text-blue-800' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="ml-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-gray-500">You don't have any new notifications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mt-8 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications in the browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Document Updates</p>
                  <p className="text-sm text-gray-500">Get notified when documents are updated</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}