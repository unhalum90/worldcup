import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | WC26 Fan Zone',
  description: 'Terms of Service for WC26 Fan Zone - World Cup 2026 travel guides, forums, and AI trip planner.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[color:var(--color-primary)] to-blue-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-gray-600 mb-8">
          Last Updated: November 10, 2024
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using WC26 Fan Zone ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              WC26 Fan Zone provides:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>City travel guides for 2026 FIFA World Cup host cities</li>
              <li>Community forums for fan discussions</li>
              <li>AI-powered travel planning tools</li>
              <li>News and updates about the 2026 World Cup</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Important:</strong> WC26 Fan Zone is not affiliated with FIFA, the 2026 FIFA World Cup organizing committee, or any official tournament entities. We are an independent fan platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When creating an account with us, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spam or post unsolicited commercial content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Content Ownership</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              User-generated content remains the property of the user. By posting content on WC26 Fan Zone, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of travel information, ticket sales dates, or AI-generated recommendations. Always verify critical information through official channels.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              WC26 Fan Zone shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. We are not responsible for travel bookings, ticket purchases, or arrangements made based on information from our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our Service may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of these third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify these Terms of Service at any time. We will notify users of material changes via email or through prominent notice on the Service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us through our{' '}
              <a href="/contact" className="text-blue-600 hover:underline">contact form</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> This is a template Terms of Service. Consult with a legal professional to ensure compliance with applicable laws in your jurisdiction.
          </p>
        </div>
      </div>
    </div>
  );
}
