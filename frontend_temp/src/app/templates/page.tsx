import Link from 'next/link';
import { FileText, Code, Mail, FileCode, FileCheck, FileType } from 'lucide-react';

type TemplateCategory = {
  name: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  href: string;
  count: number;
};

export default function TemplatesPage() {
  const templateCategories: TemplateCategory[] = [
    {
      name: 'Blog Posts',
      description: 'Professional blog post templates for various topics and styles',
      icon: <FileText className="h-6 w-6" />,
      iconColor: 'blue',
      href: '/templates/blog',
      count: 12,
    },
    {
      name: 'Code Snippets',
      description: 'Common code patterns and templates for multiple programming languages',
      icon: <Code className="h-6 w-6" />,
      iconColor: 'purple',
      href: '/templates/code',
      count: 8,
    },
    {
      name: 'Documentation',
      description: 'Templates for technical documentation and API references',
      icon: <FileCode className="h-6 w-6" />,
      iconColor: 'green',
      href: '/templates/docs',
      count: 6,
    },
    {
      name: 'Emails',
      description: 'Professional email templates for various business needs',
      icon: <Mail className="h-6 w-6" />,
      iconColor: 'amber',
      href: '/templates/emails',
      count: 10,
    },
    {
      name: 'Project Templates',
      description: 'Starter templates for different types of projects',
      icon: <FileCheck className="h-6 w-6" />,
      iconColor: 'rose',
      href: '/templates/projects',
      count: 7,
    },
    {
      name: 'Resumes',
      description: 'Professional resume and CV templates',
      icon: <FileType className="h-6 w-6" />,
      iconColor: 'indigo',
      href: '/templates/resumes',
      count: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Templates</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jumpstart your work with our professionally designed templates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateCategories.map((category) => {
            const bgColor = `bg-${category.iconColor}-50`;
            const textColor = `text-${category.iconColor}-600`;
            
            return (
              <Link
                key={category.name}
                href={category.href}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
                      {category.icon}
                    </div>
                    <span className="text-sm text-gray-500">{category.count} templates</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
