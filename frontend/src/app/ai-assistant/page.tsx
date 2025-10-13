'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, MessageSquare, FileText, Code } from 'lucide-react';
import Link from 'next/link';

export default function AIAssistantPage() {
  const tools = [
    {
      title: 'AI Writing Assistant',
      description: 'Generate high-quality content with our advanced AI writing assistant',
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
      href: '/ai/writing-assistant',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Code Generation',
      description: 'Generate code snippets in any programming language with AI',
      icon: <Code className="h-6 w-6 text-purple-600" />,
      href: '/ai/code-generation',
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'AI Chat',
      description: 'Get instant answers and assistance with our AI chat',
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      href: '/ai/chat',
      color: 'from-green-500 to-teal-600',
    },
    {
      title: 'Document Analysis',
      description: 'Upload and analyze documents with AI-powered insights',
      icon: <FileText className="h-6 w-6 text-amber-600" />,
      href: '/ai/document-analysis',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600">Powerful AI tools to enhance your productivity and creativity</p>
        </div>

        {/* Welcome Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg mr-4">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI-Powered Assistance</h2>
                <p className="mt-2 opacity-90">Use our intelligent tools to boost your productivity and generate content faster</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {tools.map((tool, index) => (
            <Link href={tool.href} key={index}>
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer border-2 border-transparent hover:border-blue-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${tool.color} text-white`}>
                      AI Enhanced
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* AI Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Smart Suggestions
              </CardTitle>
              <CardDescription>Get intelligent content suggestions as you write</CardDescription>
            </CardHeader>
            <CardContent>
              Our AI analyzes your content and provides contextually relevant suggestions to improve your writing.
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                Real-time Feedback
              </CardTitle>
              <CardDescription>Receive feedback while you type</CardDescription>
            </CardHeader>
            <CardContent>
              Get real-time grammar, style, and clarity suggestions as you work on your documents.
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Document Analysis
              </CardTitle>
              <CardDescription>Analyze documents with AI</CardDescription>
            </CardHeader>
            <CardContent>
              Upload your documents and get AI-powered insights and summaries in seconds.
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Ready to boost your productivity?</h3>
              <p className="opacity-90">Start using our AI tools today</p>
            </div>
            <Link href="/pricing">
              <div className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors text-center">
                Explore Plans
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}