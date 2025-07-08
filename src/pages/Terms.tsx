import Footer from '../components/Footer';

const Terms = () => (
  <div className="min-h-screen bg-void-gradient">
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-bold text-primary mb-4">Terms of Use</h1>
      <p className="text-secondary mb-4">
        By using Rubber Duck Tarot you acknowledge that all insights are
        generated for entertainment purposes only.
      </p>
      <p className="text-secondary mb-4">
        We make no guarantees about the accuracy of any advice. Use your own
        judgement before acting on suggestions from the duck.
      </p>
      <p className="text-secondary">
        Continuing to use the site means you accept these terms.
      </p>
    </div>
    <Footer />
  </div>
);

export default Terms;
