import { CheckCircle } from 'lucide-react';

const features = [
  'AI Writing Assistant',
  'Code Generation',
  'Document Analysis',
  'Templates',
  'Collaboration Tools',
  'API Access',
  'Priority Support',
  'Custom AI Models',
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    buttonText: 'Get Started',
    buttonVariant: 'outline',
    features: [true, true, false, true, false, false, false, false],
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For professionals and small teams',
    buttonText: 'Go Pro',
    buttonVariant: 'primary',
    featured: true,
    features: [true, true, true, true, true, false, false, false],
  },
  {
    name: 'Team',
    price: '$49',
    description: 'For growing teams',
    buttonText: 'Get Team',
    buttonVariant: 'outline',
    features: [true, true, true, true, true, true, true, false],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    buttonText: 'Contact Sales',
    buttonVariant: 'outline',
    features: [true, true, true, true, true, true, true, true],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start for free, upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, planIndex) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-sm border ${
                plan.featured ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
              } overflow-hidden`}
            >
              {plan.featured && (
                <div className="bg-blue-600 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-500">/month</span>}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium ${
                    plan.featured
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } transition-colors mb-8`}
                >
                  {plan.buttonText}
                </button>

                <ul className="space-y-3">
                  {features.map((feature, featureIndex) => (
                    <li key={feature} className="flex items-start">
                      {plan.features[featureIndex] ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-gray-300 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                question: 'Can I change plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'The free plan is available indefinitely. Paid plans include a 14-day free trial.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards and PayPal.'
              },
              {
                question: 'Do you offer discounts for non-profits?',
                answer: 'Yes, we offer special pricing for non-profit organizations. Please contact our sales team.'
              }
            ].map((faq, index) => (
              <div key={index}>
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
