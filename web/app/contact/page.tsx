import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | WC26 Fan Zone',
  description: 'Get in touch with WC26 Fan Zone team. Questions, feedback, partnerships, or media inquiries welcome.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[color:var(--color-primary)] to-blue-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg">
            Have questions, feedback, or partnership inquiries? We'd love to hear from you!
          </p>
        </div>

        {/* Contact Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* General Inquiries */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">General Inquiries</h3>
            <p className="text-gray-600 text-sm mb-4">
              Questions about our platform, features, or how to use the site
            </p>
            <a
              href="#contact-form"
              className="text-blue-600 hover:underline font-semibold text-sm"
            >
              Use contact form
            </a>
          </div>

          {/* Technical Support */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-2">Technical Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Having technical issues or need help with your account?
            </p>
            <a
              href="#contact-form"
              className="text-blue-600 hover:underline font-semibold text-sm"
            >
              Get support
            </a>
          </div>

          {/* Partnerships */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Partnerships</h3>
            <p className="text-gray-600 text-sm mb-4">
              Interested in collaborating or business opportunities?
            </p>
            <a
              href="#contact-form"
              className="text-blue-600 hover:underline font-semibold text-sm"
            >
              Share details
            </a>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-xl font-bold mb-2">Media Inquiries</h3>
            <p className="text-gray-600 text-sm mb-4">
              Press, journalists, or content creators
            </p>
            <a
              href="#contact-form"
              className="text-blue-600 hover:underline font-semibold text-sm"
            >
              Reach out
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact-form" className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select a topic...</option>
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="media">Media Inquiry</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Send Message →
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            We typically respond within 24-48 hours during business days.
          </p>
        </div>

        {/* Social Media */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
          <div className="flex justify-center gap-4">
            {[
              { name: 'Reddit', icon: '🔴', href: '#' },
              { name: 'Instagram', icon: '📷', href: '#' },
              { name: 'X/Twitter', icon: '𝕏', href: '#' },
              { name: 'YouTube', icon: '▶️', href: '#' },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="w-14 h-14 rounded-full bg-gray-100 hover:bg-[color:var(--color-primary)] hover:text-white flex items-center justify-center text-2xl transition-all hover:scale-110 shadow-md"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200 max-w-2xl mx-auto text-center">
          <h3 className="font-bold text-lg mb-2">Looking for Quick Answers?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Check out our FAQ section for commonly asked questions about the platform and World Cup 2026.
          </p>
          <a 
            href="/faq" 
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            View FAQ
          </a>
        </div>
      </div>
    </div>
  );
}
