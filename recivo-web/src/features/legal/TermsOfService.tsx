import { Link } from 'react-router-dom';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-300">Last updated: January 12, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using Recivo ("the Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to these terms, please do not 
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700">
              Recivo provides a digital receipt management platform that allows users to store, organize, 
              and manage their receipts electronically. The Service includes features for receipt scanning, 
              categorization, and expense tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content</h2>
            <p className="text-gray-700 mb-4">
              You retain ownership of all content you upload to the Service. By uploading content, you grant 
              Recivo a license to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Store and process your receipts and data</li>
              <li>Use OCR and AI to extract information from receipts</li>
              <li>Display your content back to you within the Service</li>
              <li>Create backups for data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment and Subscription</h2>
            <p className="text-gray-700">
              Some features of the Service require payment. By subscribing to a paid plan, you agree to 
              pay all applicable fees. Subscriptions automatically renew unless cancelled. Refunds are 
              provided in accordance with our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Backup and Loss</h2>
            <p className="text-gray-700">
              While we implement reasonable measures to protect your data, we are not liable for any 
              loss of data. We recommend maintaining your own backups of important receipts and documents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Modifications</h2>
            <p className="text-gray-700">
              We reserve the right to modify or discontinue the Service at any time, with or without notice. 
              We will not be liable to you or any third party for any modification, suspension, or 
              discontinuance of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, Recivo shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of or 
              inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700">
              We may terminate or suspend your account and access to the Service immediately, without 
              prior notice, for any reason, including breach of these Terms. Upon termination, your 
              right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the 
              jurisdiction in which Recivo operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of any 
              material changes. Your continued use of the Service after such modifications constitutes 
              your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-emerald-600 font-medium mt-2">
              cosdevsph@outlook.ph
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/privacy-policy" 
            className="text-emerald-400 hover:text-emerald-300 transition text-sm"
          >
            ← View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};