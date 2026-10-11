import React from 'react';

export const TermsPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
    <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
    <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-xs text-slate-600 space-y-4 leading-relaxed">
      <p>Welcome to CampusMart. By using our platform, you agree to comply with all university honor codes and local laws.</p>
      <h3 className="font-bold text-slate-800">1. Student Identity Verification</h3>
      <p>All users must provide accurate student credentials. Impersonation of another student is strictly prohibited.</p>
      <h3 className="font-bold text-slate-800">2. Listing Rules</h3>
      <p>Prohibited items include weapons, illegal substances, stolen property, or pirated exam solutions.</p>
      <h3 className="font-bold text-slate-800">3. Transactions & Safety</h3>
      <p>All physical exchanges must take place in safe public campus areas.</p>
    </div>
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
    <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
    <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-xs text-slate-600 space-y-4 leading-relaxed">
      <p>Your privacy is important to us. CampusMart encrypts user passwords with bcrypt and never sells student personal data to third parties.</p>
      <h3 className="font-bold text-slate-800">Data Collection</h3>
      <p>We collect student email addresses, uploaded listing details, and message logs strictly to facilitate campus marketplace transactions.</p>
    </div>
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
    <h1 className="text-2xl font-extrabold text-slate-900">Help & Support</h1>
    <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-xs text-slate-600 space-y-4">
      <p>Have questions or need help with a transaction or verification request?</p>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="font-bold text-slate-800">Campus Moderation Desk</p>
        <p className="text-slate-500">Email: support@campusmart.edu</p>
        <p className="text-slate-500">Hours: Mon-Fri 9:00 AM - 6:00 PM EST</p>
      </div>
    </div>
  </div>
);
