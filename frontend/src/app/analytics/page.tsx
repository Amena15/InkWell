'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Eye, FileText, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    {
      title: 'Total Documents',
      value: '24',
      change: '+5 from last month',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Active Users',
      value: '12',
      change: '+2 from yesterday',
      icon: <Users className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Views Today',
      value: '142',
      change: '+12% from yesterday',
      icon: <Eye className="h-6 w-6 text-purple-600" />,
    },
    {
      title: 'Avg. Completion',
      value: '78%',
      change: '+4% from last week',
      icon: <BarChart3 className="h-6 w-6 text-amber-600" />,
    },
  ];

  // Mock data for charts
  const documentActivity = [
    { day: 'Mon', docs: 12 },
    { day: 'Tue', docs: 19 },
    { day: 'Wed', docs: 8 },
    { day: 'Thu', docs: 15 },
    { day: 'Fri', docs: 11 },
    { day: 'Sat', docs: 6 },
    { day: 'Sun', docs: 9 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your document activity and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardDescription className="text-sm text-gray-500">{stat.title}</CardDescription>
                  <CardTitle className="text-2xl mt-1">{stat.value}</CardTitle>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Activity Chart */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Document Activity</CardTitle>
              <CardDescription>Documents created in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">Activity chart would appear here</p>
                  <p className="text-sm">In a full implementation, this would show detailed analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Activity Chart */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>How users interacted with documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-2">User engagement metrics would appear here</p>
                  <p className="text-sm">In a full implementation, this would show detailed user metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest document interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Document {item}</p>
                      <p className="text-sm text-gray-500">Edited 2 hours ago</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">by User {item}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}