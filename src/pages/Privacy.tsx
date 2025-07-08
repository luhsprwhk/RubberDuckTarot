import Footer from '../components/Footer';

const Privacy = () => (
  <div className="min-h-screen bg-void-gradient">
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
      <p className="text-secondary mb-4">
        Rubber Duck Tarot stores your account information in Supabase. We never
        sell or share your personal data with third parties.
      </p>
      <p className="text-secondary mb-4">
        All consultation content is encrypted with AES-256-GCM before being
        written to our database.
      </p>
      <p className="text-secondary">
        This service is for entertainment only. Contact us if you have any
        questions about your data.
      </p>
    </div>
    <Footer />
  </div>
);

export default Privacy;
