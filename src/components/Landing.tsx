import { Star, ArrowRight, User, Zap, Target, Shield } from 'lucide-react';
import useAuth from '@/src/lib/hooks/useAuth';
import DuckHero from '@/src/assets/landing-hero.png';
import DuckLinkedin from '@/src/assets/rob-linkedin.png';
import robEmoji from '@/src/assets/rob-emoji.png';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const { showAuthModal } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-void-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Mascot Area */}
          <div className="mb-8">
            <img
              src={DuckHero}
              alt="Rubber Duck"
              className="w-96 h-96 mx-auto"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-5xl font-bold text-primary mb-4 leading-tight">
              Rubber Duck Tarot
            </h1>
            <h2 className="text-accent text-2xl font-semibold">
              Perspective Debugging for Creatives
            </h2>
          </div>

          <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
            When you're stuck, consult the duck. Rob's a dead developer who
            spent 25 years coding other people's dreams while his indie game
            prototypes collected dust. Now he helps creative people debug their
            lives from beyond the grave
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => showAuthModal('signUp')}
              className="bg-breakthrough-400 text-void-900 px-8 py-4 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-breakthrough"
            >
              Start Free Consultation
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/cards')}
              className="border-2 border-default text-secondary px-8 py-4 rounded-lg font-semibold hover:border-hover hover:text-accent transition-all duration-200"
            >
              View Cards
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-breakthrough-400 text-breakthrough-400" />
              <span className="font-medium text-primary">4.9/5</span>
              <span>ethereal rating</span>
            </div>
            <div>
              <span className="font-medium text-primary">1,247</span> souls
              debugged
            </div>
            <div>
              <span className="font-medium text-primary">25+</span> years
              experience
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-liminal-overlay py-16 backdrop-blur-liminal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Debugging Services
            </h2>
            <p className="text-secondary max-w-2xl mx-auto">
              Specialized consultation for the living, drawing from hard-won
              experience and the unique perspective that only death can provide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-surface p-6 rounded-lg border border-liminal-border hover:border-breakthrough-400/50 transition-all duration-300 group backdrop-blur-liminal">
              <Target className="w-12 h-12 text-breakthrough-400 mb-4 group-hover:text-breakthrough-300 transition-colors" />
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Life Direction
              </h3>
              <p className="text-secondary text-sm">
                Navigate major life transitions and find clarity in chaos. Death
                gives excellent perspective on what actually matters.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-liminal-border hover:border-breakthrough-400/50 transition-all duration-300 group backdrop-blur-liminal">
              <Zap className="w-12 h-12 text-breakthrough-400 mb-4 group-hover:text-breakthrough-300 transition-colors" />
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Creative Unblocking
              </h3>
              <p className="text-secondary text-sm">
                Overcome creative blocks using proven debugging methodologies.
                Death gives excellent perspective on what actually matters.
              </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-liminal-border hover:border-breakthrough-400/50 transition-all duration-300 group backdrop-blur-liminal">
              <User className="w-12 h-12 text-breakthrough-400 mb-4 group-hover:text-breakthrough-300 transition-colors" />
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Career Consultation
              </h3>
              <p className="text-secondary text-sm">
                Navigate professional challenges with insights from someone
                who's seen every tech trend die (and then died himself).
              </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-liminal-border hover:border-breakthrough-400/50 transition-all duration-300 group backdrop-blur-liminal">
              <Shield className="w-12 h-12 text-breakthrough-400 mb-4 group-hover:text-breakthrough-300 transition-colors" />
              <h3 className="text-lg font-semibold mb-3 text-primary">
                Risk Calibration
              </h3>
              <p className="text-secondary text-sm">
                Learn to take smart creative and career risks instead of playing
                it safe until you die of boredom. Rob helps you distinguish
                between reckless gambling and calculated bets that could change
                your life.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">
                  Meet Your Consultant
                </h2>
                <p className="text-secondary mb-4">
                  Robert Chen (1977-2023) was a full-stack developer with 25+
                  years of experience in breaking things and occasionally fixing
                  them. After drowning at a startup Halloween party while
                  avoiding yet another pitch deck, his soul became permanently
                  bonded to a rubber duck wearing a wizard hat.
                </p>
                <p className="text-secondary mb-6">
                  Now operating from beyond the grave, Rob offers debugging
                  services with the unique perspective that only death can
                  provide. His ethereal consultancy focuses on practical
                  problem-solving without the limitations of physical form or
                  corporate politics.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-breakthrough-500/20 text-breakthrough-300 border border-breakthrough-500/30 px-3 py-1 rounded-full text-sm">
                    Full-Stack Development
                  </span>
                  <span className="bg-breakthrough-500/20 text-breakthrough-300 border border-breakthrough-500/30 px-3 py-1 rounded-full text-sm">
                    Problem Decomposition
                  </span>
                  <span className="bg-breakthrough-500/20 text-breakthrough-300 border border-breakthrough-500/30 px-3 py-1 rounded-full text-sm">
                    Afterlife Insights
                  </span>
                  <span className="bg-breakthrough-500/20 text-breakthrough-300 border border-breakthrough-500/30 px-3 py-1 rounded-full text-sm">
                    Startup Survivor
                  </span>
                </div>
              </div>

              <div className="bg-overlay p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center mb-4 shadow-glow animate-flicker">
                    <img
                      src={DuckLinkedin}
                      alt="Rubber Duck"
                      className="w-64 h-36"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    Rob Chen
                  </h3>
                  <p className="text-accent font-medium mb-4">
                    Senior Ethereal Consultant
                  </p>
                  <div className="text-sm text-secondary space-y-1">
                    <div>📧 rob@rubberducktarot.com</div>
                    <div>📱 Available via digital seance</div>
                    <div>👻 Operating from beyond the grave</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-liminal-overlay py-16 backdrop-blur-liminal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Client Testimonials
            </h2>
            <p className="text-secondary">
              What the living are saying about my otherworldly services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-breakthrough-400 text-breakthrough-400"
                  />
                ))}
              </div>
              <p className="text-secondary mb-4">
                "I've been stuck between my fintech job and game dev dreams for
                years. Rob's perspective cut through all my analysis paralysis -
                stopped researching 'market viability' and just started
                prototyping.
                <br /> <br />
                Shipped my first game demo last month!"
                <br />
                <br />
                <span className="font-medium text-primary">Dana K.</span>
                <br />
                <span className="text-muted">
                  Senior Backend Engineer, Fintech
                </span>
              </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-breakthrough-400 text-breakthrough-400"
                  />
                ))}
              </div>
              <p className="text-secondary mb-4">
                "Rob helped me stop treating my real estate career and music
                like they're at war with each other. Turns out my people skills
                from selling houses actually make my songwriting more authentic.
                Finally making progress on both fronts."
                <br />
                <br />
                <span className="font-medium text-primary">Melody R.</span>
                <br />
                <span className="text-muted">
                  Real Estate Agent & Singer-Songwriter
                </span>
              </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-breakthrough-400 text-breakthrough-400"
                  />
                ))}
              </div>
              <p className="text-secondary mb-4">
                "Rob's debugging methodology works for more than just code.
                Helped me realize I was optimizing the wrong variables in my
                startup.
                <br /> <br />
                We pivoted, found product-market fit, and closed our Series A.
                Death gives excellent business perspective."
                <br />
                <br />
                <span className="font-medium text-primary">Alex R.</span>
                <br />
                <span className="text-muted">Founder, DevTools Startup</span>
                <br />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Ready to Debug Your Blocks?
            </h2>
            <p className="text-xl text-secondary mb-8">
              Start your free consultation with Rubber Duck Tarot. No mystical
              nonsense, just practical problem-solving from beyond the grave.
            </p>
            <button
              onClick={() => showAuthModal('signUp')}
              className="bg-breakthrough-400 text-void-900 px-8 py-4 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 text-lg shadow-breakthrough"
            >
              Begin Free Consultation
            </button>
            <p className="text-sm text-muted mt-4">
              * No seance required. Standard spiritual rates apply.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-void-950 border-t border-liminal-border py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={robEmoji} alt="Rob" className="w-8 h-8" />
            <span className="font-semibold text-primary">
              Rubber Duck Tarot
            </span>
          </div>
          <p className="text-muted text-sm">
            Professional debugging services from beyond the grave since 2025
          </p>
          <p className="text-muted text-xs mt-2">
            Rob Chen (1977-2023) • Licensed Ethereal Consultant • No returns
            policy (obviously)
          </p>
        </div>
      </div>
      <div className="flex text-center items-center justify-center gap-2 mt-4 p-4 bg-black text-muted ">
        <span className="text-sm">
          An app by
          <a
            href="https://luhsprwhk.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline ml-1 mr-1"
          >
            @luhsprwhk
          </a>
          &copy; {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
};

export default Landing;
