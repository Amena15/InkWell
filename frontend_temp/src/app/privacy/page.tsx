import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | InkWell',
  description: 'Learn how we protect and manage your data at InkWell.',
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to InkWell. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
          <p className="mb-4">We may collect, use, store, and transfer different kinds of personal data about you, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Identity Data (name, username, or similar identifier)</li>
            <li>Contact Data (email address, phone number)</li>
            <li>Profile Data (username, password, preferences, feedback)</li>
            <li>Usage Data (how you use our website, products, and services)</li>
            <li>Technical Data (IP address, browser type, time zone setting)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
          <p className="mb-4">We will only use your personal data when the law allows us to, including to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Register you as a new customer</li>
            <li>Process and deliver your orders</li>
            <li>Manage our relationship with you</li>
            <li>Improve our website, products, and services</li>
            <li>Recommend products or services that may be of interest to you</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-4">
            We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those employees and other third parties who have a business need to know.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">5. Your Legal Rights</h2>
          <p className="mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Right to withdraw consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p className="mb-2">Email: privacy@inkwell.com</p>
          <p>Mailing Address: 123 Writing Lane, San Francisco, CA 94103</p>
        </section>

        <div className="text-sm text-muted-foreground mt-12 pt-6 border-t">
          <p>This privacy policy was last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
          <p className="mt-2">
            <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
