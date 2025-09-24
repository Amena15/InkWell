import { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact Us | InkWell',
  description: 'Get in touch with the InkWell team. We\'re here to help with any questions or feedback.',
};

export default function ContactPage() {
  return (
    <div>
      <div className="bg-background">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>
      
      <ContactForm />
    </div>
  );
}
