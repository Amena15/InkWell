'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Zap, 
  Code, 
  MessageSquare, 
  FileText, 
  Share2, 
  Users, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'AI-Powered Writing',
    description: 'Generate high-quality content with our advanced AI writing assistant',
    color: 'from-blue-500 to-indigo-600',
    link: '/ai-tools'
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: 'Code Generation',
    description: 'Generate code snippets in any programming language with AI',
    color: 'from-purple-500 to-pink-600',
    link: '/ai-tools'
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'AI Chat',
    description: 'Get instant answers and assistance with our AI chat',
    color: 'from-green-500 to-teal-600',
    link: '/ai-tools'
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Document Analysis',
    description: 'Upload and analyze documents with AI-powered insights',
    color: 'from-amber-500 to-orange-600',
    link: '/ai-tools'
  },
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Content Optimization',
    description: 'Enhance your writing with AI-powered suggestions',
    color: 'from-rose-500 to-pink-600',
    link: '/ai-tools'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Team Collaboration',
    description: 'Real-time collaboration with AI assistance',
    color: 'from-indigo-500 to-blue-600',
    link: '/collaboration'
  }
];

const testimonials = [
  {
    quote: "InkWell has transformed how our team collaborates on documents. The real-time editing is seamless!",
    author: "Sarah Johnson",
    role: "Product Manager at TechCorp"
  },
  {
    quote: "The clean interface and powerful features make this our go-to writing tool.",
    author: "Michael Chen",
    role: "Engineering Lead at DevHouse"
  },
  {
    quote: "Best document editor I've used. The organization features are a game-changer.",
    author: "Emma Davis",
    role: "Content Strategist at Creatives Inc"
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Powerful Features for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Modern Writers
              </span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover all the tools and capabilities that make InkWell the perfect writing platform for individuals and teams.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to be productive
            </p>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Powerful features to help you create your best work
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <Link href={feature.link} className="text-blue-600 hover:text-blue-900 transition-colors mt-4 block">Learn more</Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              href="/ai-tools" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              Explore all AI tools
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                Why choose InkWell?
              </h2>
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-500 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Real-time Collaboration</h3>
                    <p className="mt-2 text-gray-600">
                      Work together with your team in real-time, with instant updates and version control.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-500 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">AI-Powered Assistance</h3>
                    <p className="mt-2 text-gray-600">
                      Get intelligent suggestions and automated content generation to boost your productivity.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-blue-500 text-white">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Secure & Private</h3>
                    <p className="mt-2 text-gray-600">
                      Your documents are encrypted and stored securely with enterprise-grade privacy controls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="aspect-w-16 aspect-h-9">
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-4xl font-bold text-gray-800 mb-2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Powerful Editor
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">Intuitive interface with advanced formatting options</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Rich Text', 'Real-time Collaboration', 'Version History', 'Comments'].map((feature, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Trusted by teams worldwide</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
              Join thousands of satisfied users who trust InkWell for their writing needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-8 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block">Start your free trial today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              Join thousands of teams who use InkWell to be more productive.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Get started for free
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}