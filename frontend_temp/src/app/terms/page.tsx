import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | InkWell',
  description: 'Read our Terms of Service to understand your rights and responsibilities when using InkWell.',
};

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the InkWell platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            InkWell provides an online platform for document creation, management, and collaboration. The Service may be modified, updated, or discontinued at our sole discretion without prior notice.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="mb-4">To access certain features of the Service, you must create an account. You agree to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Be responsible for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
          <p className="mb-4">
            You retain ownership of any intellectual property rights that you hold in the content you submit or display on or through the Service ("User Content"). By submitting User Content, you grant InkWell a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content for the purpose of providing the Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
          <p className="mb-4">You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Violate any laws or regulations</li>
            <li>Infringe on the intellectual property rights of others</li>
            <li>Upload or distribute harmful or malicious content</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Impersonate any person or entity</li>
            <li>Collect information about other users without their consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall InkWell, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice of any changes by posting the new Terms on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mb-2">Email: legal@inkwell.com</p>
          <p>Mailing Address: 123 Writing Lane, San Francisco, CA 94103</p>
        </section>

        <div className="text-sm text-muted-foreground mt-12 pt-6 border-t">
          <p>These Terms of Service were last updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
          <p className="mt-2">
            <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
