'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  FileText,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  BookOpen,
  Code,
  Palette,
  Globe,
  Mail,
  MessageCircle,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

const HomePage = () => {
  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Writing",
      description: "Generate content, improve writing, and get smart suggestions powered by advanced AI"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Document Management",
      description: "Create, edit, and organize documents with our intuitive editor and workflow tools"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time with live document editing and comments"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-platform Access",
      description: "Access your documents from anywhere on any device with our cloud platform"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics & Insights",
      description: "Track your writing progress and get insights to improve your content creation"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Customizable Templates",
      description: "Use and create custom templates to speed up your document creation process"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Manager",
      content: "InkWell has transformed how our team creates content. The AI features save us hours of work every week.",
      avatar: "SJ",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Technical Writer",
      content: "The document management system is intuitive and powerful. Collaboration features are a game-changer.",
      avatar: "MC",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Marketing Director",
      content: "Our content production has increased 3x since implementing InkWell. The AI suggestions are incredibly helpful.",
      avatar: "ER",
      rating: 5
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "5M+", label: "Documents Created" },
    { value: "99.9%", label: "Uptime" },
    { value: "50%", label: "Time Saved" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30 -z-10"></div>

        <div className="container mx-auto px-4 py-16 md:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1 text-sm">
                  New Features
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-6">
                Write Better, Faster, Smarter
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                InkWell transforms your writing experience with AI-powered assistance, real-time collaboration, and intelligent document management. Create amazing content with ease.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-12 px-8 text-lg" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg" asChild>
                  <Link href="/demo">
                    Watch Demo
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center lg:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-30 animate-blob"></div>
                <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-30 animate-blob-delayed"></div>

                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-1 border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                      <div className="h-4 bg-blue-500 dark:bg-blue-600 rounded w-2/3"></div>
                      <div className="flex gap-2 mt-4">
                        <div className="h-8 bg-blue-500 rounded px-4 flex items-center text-white text-sm font-medium">
                          AI Edit
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded px-4 flex items-center text-gray-700 dark:text-gray-300 text-sm">
                          Suggest
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern Writing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to create, collaborate, and publish amazing content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Creators Worldwide</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Hear from professionals who have transformed their writing process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full p-6 border-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Writing?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Join thousands of creators using InkWell to write better, faster, and smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-12 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-lg border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">
                  Contact Sales
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4">Start Your Writing Journey Today</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Create an account and experience the future of AI-assisted writing. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
