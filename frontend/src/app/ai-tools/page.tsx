import Link from 'next/link';
import { Code, FileText, MessageSquare, Zap } from 'lucide-react';

export default function AIToolsPage() {
  const tools = [
    {
      name: 'AI Writing Assistant',
      description: 'Generate high-quality content with our advanced AI writing assistant',
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      href: '/ai/writing',
      color: 'bg-blue-50',
    },
    {
      name: 'Code Generation',
      description: 'Generate code snippets in any programming language with AI',
      icon: <Code className="h-8 w-8 text-purple-600" />,
      href: '/ai/code',
      color: 'bg-purple-50',
    },
    {
      name: 'AI Chat',
      description: 'Get instant answers and assistance with our AI chat',
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      href: '/ai/chat',
      color: 'bg-green-50',
    },
    {
      name: 'Document Analysis',
      description: 'Upload and analyze documents with AI-powered insights',
      icon: <FileText className="h-8 w-8 text-amber-600" />,
      href: '/ai/analysis',
      color: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful AI tools to enhance your productivity and creativity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
