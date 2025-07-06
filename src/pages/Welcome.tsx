import { Link } from 'react-router-dom';
import { CheckCircle, Users, Zap, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import useAuth from '@/src/lib/hooks/useAuth';
import { isWaitlistEnabled } from '@/src/lib/featureFlags';
import robEmoji from '@/src/assets/rob-emoji.png';
import welcomeHero from '@/src/assets/welcome-hero.png';

export default function Welcome() {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (isWaitlistEnabled() && user) {
      console.log('User is signed in and waitlist is enabled');
      signOut();
    }
  }, [user, signOut]);

  return (
    <div className="min-h-screen bg-void-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-80 h-80 mx-auto flex items-center justify-center mb-6 shadow-glow animate-pulse-glow">
              <img
                id="welcome-hero"
                src={welcomeHero}
                alt="Rob the Rubber Duck"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-breakthrough-400/20 text-breakthrough-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4" />
                Successfully Added to Waitlist
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
              Welcome to{' '}
              <span className="text-breakthrough-400">Rubber Duck Tarot</span>
            </h1>

            <p className="text-xl text-secondary mb-6 max-w-2xl mx-auto leading-relaxed">
              You're now on the list for the most practical decision-making tool
              disguised as tarot cards. Rob will notify you personally when your
              invitation is ready.
            </p>
          </div>
        </div>

        {/* Rob's Personal Message */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-surface/80 p-8 rounded-2xl border border-liminal-border backdrop-blur-liminal shadow-glow">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center flex-shrink-0">
                <img src={robEmoji} alt="Rob" className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  Rob's Personal Welcome Message
                </h3>
                <div className="text-secondary space-y-3 leading-relaxed">
                  <p>
                    Thanks for joining the waitlist. I died avoiding startup
                    pitch decks and got stuck in this rubber duck, so I
                    appreciate when people actually <em>want</em> to hear what I
                    have to say.
                  </p>
                  <p>
                    While you wait, I'm putting the finishing touches on the
                    card system and making sure my debugging advice doesn't
                    crash anyone's life. I learned that lesson the hard way in
                    production.
                  </p>
                  <p className="text-breakthrough-400 font-medium">
                    I'll send you early access soon. In the meantime, keep your
                    debugging spirits up.
                  </p>
                </div>
                <div className="text-sm text-muted mt-4">
                  Rob Chen, Senior Ethereal Consultant
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-primary text-center mb-8">
            What You're Getting Access To
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface/60 p-6 rounded-xl border border-liminal-border backdrop-blur-liminal">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-breakthrough-400" />
                <h3 className="text-lg font-semibold text-primary">
                  Perspective Cards
                </h3>
              </div>
              <p className="text-secondary mb-4">
                36 debugging tools disguised as cards. No mystical nonsense just
                practical reframes for when you're stuck in mental loops.
              </p>
              <div className="text-sm text-muted">
                🌦️ Weather App (uncertainty navigation)
                <br />
                🗑️ Delete Button (decisive cuts)
                <br />
                🔌 Charging Cable (untangling complexity)
              </div>
            </div>

            <div className="bg-surface/60 p-6 rounded-xl border border-liminal-border backdrop-blur-liminal">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-breakthrough-400" />
                <h3 className="text-lg font-semibold text-primary">
                  Intelligence Engine
                </h3>
              </div>
              <p className="text-secondary mb-4">
                Rob learns your patterns so he can spot when you're asking the
                same question 50 different ways and give you pattern-breaking
                insights.
              </p>
              <div className="text-sm text-muted">
                🔄 Loop detection and intervention
                <br />
                📈 Success pattern analysis
                <br />
                💡 Smart recommendations
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-surface/60 p-6 rounded-xl border border-liminal-border backdrop-blur-liminal">
            <h3 className="text-lg font-semibold text-primary mb-4 text-center">
              What Happens Next
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-breakthrough-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-void-900 text-sm font-bold">1</span>
                </div>
                <div>
                  <div className="font-medium text-primary">
                    We're building your access
                  </div>
                  <div className="text-sm text-secondary">
                    Rob's testing the final card algorithms
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-breakthrough-400/60 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-sm font-bold">2</span>
                </div>
                <div>
                  <div className="font-medium text-primary">
                    You'll get an invitation email
                  </div>
                  <div className="text-sm text-secondary">
                    Direct from Rob (probably with debugging puns)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-breakthrough-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-sm font-bold">3</span>
                </div>
                <div>
                  <div className="font-medium text-primary">
                    Start debugging your blocks
                  </div>
                  <div className="text-sm text-secondary">
                    Free tier + premium upgrade when you're ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            While You Wait
          </h2>
          <p className="text-secondary mb-6 max-w-2xl mx-auto">
            Check out the full feature breakdown and see exactly what Rob's been
            building for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/features"
              className="bg-breakthrough-400 text-void-900 px-8 py-4 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-breakthrough"
            >
              Explore Features
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/"
              className="border-2 border-liminal-border text-secondary px-8 py-4 rounded-lg font-medium hover:bg-surface/20 transition-colors duration-200"
            >
              Return Home
            </Link>
          </div>

          <div className="max-w-md mx-auto">
            <div className="text-sm text-muted mb-2">
              Questions about your invitation?
            </div>
            <Link
              to="mailto:rob@rubberducktarot.com"
              className="text-breakthrough-400 hover:text-breakthrough-300 underline"
            >
              rob@rubberducktarot.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
