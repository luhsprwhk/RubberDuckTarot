import { Check, X, Zap, Crown, Ghost, ArrowRight } from 'lucide-react';
import Footer from '@/src/components/Footer';
import useAuth from '@/src/lib/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import PricingPic from '@/src/assets/pricing-hero.png';
import robEmoji from '@/src/assets/rob-emoji.png';
import { isAuthEnabled } from '@/src/lib/featureFlags';

const Pricing = () => {
  const { showAuthModal, user } = useAuth();
  const navigate = useNavigate();
  const authEnabled = isAuthEnabled();

  useEffect(() => {
    if (authEnabled && user) {
      navigate('/upgrade', { replace: true });
    }
  }, [authEnabled, user, navigate]);

  return (
    <div className={cn('min-h-screen bg-void-gradient')}>
      {/* Hero Section */}
      <div className={cn('container mx-auto px-4 pt-16')}>
        <div className={cn('text-center max-w-4xl mx-auto')}>
          <div className={cn('mb-8')}>
            <div
              id="rob-pricing-pic"
              className={cn(
                'w-96 h-96 mx-auto',
                'bg-gradient-to-br from-breakthrough-400 to-breakthrough-500',
                'rounded-full flex items-center justify-center mb-4 animate-flicker'
              )}
            >
              <img
                src={PricingPic}
                alt="Rubber Duck"
                className="w-full h-full"
              />
            </div>
          </div>

          <h1
            className={cn('text-5xl font-bold text-primary mb-4 leading-tight')}
          >
            Choose Your Debugging Plan
          </h1>
          <p className={cn('text-xl text-secondary mb-8 max-w-2xl mx-auto')}>
            I died avoiding decisions, so I made this one simple. Pick free or
            premium. No enterprise plans, no "contact sales" - I'm literally
            dead, who am I gonna call?
          </p>
        </div>
      </div>

      {/* Rob's Commentary */}
      <div className={cn('bg-liminal-overlay pt-7 pb-6 backdrop-blur-liminal')}>
        <div className={cn('container mx-auto px-4')}>
          <div
            className={cn(
              'max-w-3xl mx-auto bg-surface p-6 rounded-xl border border-liminal-border backdrop-blur-liminal'
            )}
          >
            <div className={cn('flex items-start gap-4')}>
              <div
                className={cn(
                  'w-16 h-16 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full',
                  'flex items-center justify-center flex-shrink-0 animate-pulse-glow'
                )}
              >
                <img src={robEmoji} alt="Rob" className="w-16 h-16" />
              </div>
              <div>
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  Rob's Honest Take
                </h3>
                <p className={cn('text-secondary text-sm leading-relaxed')}>
                  Look, I spent 25 years watching companies overcomplicate their
                  pricing pages with "Enterprise" and "Contact Sales" nonsense.
                  I'm dead now, so I can tell you the truth:{' '}
                  <span className={cn('text-breakthrough-400')}>
                    people just want to know if the thing works and what it
                    costs
                  </span>
                  .
                  <br /> <br />
                  Free version gets you unstuck. Premium version gets you
                  unstuck <em>faster</em> and shows you patterns so you stop
                  getting stuck in the same ways.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className={cn('py-16')}>
        <div className={cn('container mx-auto px-4')}>
          <div className={cn('grid md:grid-cols-2 gap-8 max-w-5xl mx-auto')}>
            {/* Free Plan */}
            <div
              className={cn(
                'bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal'
              )}
            >
              <div className={cn('text-center mb-6')}>
                <div
                  className={cn(
                    'w-16 h-16 mx-auto bg-void-700 rounded-full flex items-center justify-center mb-4'
                  )}
                >
                  <Ghost className={cn('w-8 h-8 text-secondary')} />
                </div>
                <h3 className={cn('text-2xl font-bold text-primary mb-2')}>
                  Free Duck
                </h3>
                <div className={cn('text-3xl font-bold text-primary mb-1')}>
                  $0
                </div>
                <div className={cn('text-muted text-sm')}>forever</div>
              </div>

              <div className={cn('mb-8')}>
                <div
                  className={cn(
                    'bg-void-800/50 p-4 rounded-lg border border-void-600 mb-6'
                  )}
                >
                  <p className={cn('text-secondary text-sm italic')}>
                    "Perfect for skeptics, dabblers, and people who think
                    talking to rubber ducks is weird but are desperate enough to
                    try it anyway."
                  </p>
                </div>

                <ul className={cn('space-y-3')}>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Limited Consultations
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      7-day consultation history
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Predictive unblocking suggestions
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Rob's standard debugging wisdom
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <X className={cn('w-5 h-5 text-muted flex-shrink-0')} />
                    <span className={cn('text-muted text-sm line-through')}>
                      Ad-free experience
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <X className={cn('w-5 h-5 text-muted flex-shrink-0')} />
                    <span className={cn('text-secondary text-sm')}>
                      Rob's Intelligence Engine (limited to 100 consultations)
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => showAuthModal('signUp')}
                className={cn(
                  'w-full bg-void-700 text-primary px-6 py-3 rounded-lg font-medium hover:bg-void-600 transition-colors duration-200 border border-void-600'
                )}
              >
                {authEnabled ? 'Start Free Debugging' : 'Join Waitlist'}
              </button>
            </div>

            {/* Premium Plan */}
            <div
              className={cn(
                'bg-surface p-8 rounded-xl border border-breakthrough-400/50 backdrop-blur-liminal relative overflow-hidden'
              )}
            >
              {/* Premium Badge */}
              <div
                className={cn(
                  'absolute top-0 right-0 bg-gradient-to-r from-breakthrough-400 to-breakthrough-500 text-void-900 px-4 py-1 text-xs font-bold'
                )}
              >
                MOST POPULAR
              </div>

              <div className={cn('text-center mb-6')}>
                <div
                  className={cn(
                    'w-16 h-16 mx-auto bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center mb-4 animate-pulse-glow shadow-glow'
                  )}
                >
                  <Crown className={cn('w-8 h-8 text-primary')} />
                </div>
                <h3 className={cn('text-2xl font-bold text-primary mb-2')}>
                  Premium Duck
                </h3>
                <div className={cn('text-3xl font-bold text-primary mb-1')}>
                  $4.99
                </div>
                <div className={cn('text-muted text-sm')}>per month</div>
              </div>

              <div className={cn('mb-8')}>
                <div
                  className={cn(
                    'bg-breakthrough-500/10 p-4 rounded-lg border border-breakthrough-500/30 mb-6'
                  )}
                >
                  <p className={cn('text-secondary text-sm italic')}>
                    "For people serious about debugging their lives. I've seen
                    your consultation patterns, and trust me, you need the
                    pattern analysis more than you think."
                  </p>
                </div>

                <div
                  className={cn(
                    'text-breakthrough-400 text-sm font-medium mb-3'
                  )}
                >
                  Everything in Free, plus:
                </div>
                <ul className={cn('space-y-3')}>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Unlimited consultations (no daily limits)
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Ad-free experience
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Complete consultation history archive
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Rob's Intelligence Engine</strong> - pattern
                      analysis
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Monthly "Rob's Assessment" reports
                    </span>
                  </li>

                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      Priority ethereal support
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => showAuthModal('signUp')}
                className={cn(
                  'w-full bg-breakthrough-400 text-void-900 px-6 py-3 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 shadow-breakthrough flex items-center justify-center gap-2'
                )}
              >
                {authEnabled ? 'Upgrade to Premium' : 'Join Premium Waitlist'}
                <ArrowRight className={cn('w-5 h-5')} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rob's Sales Pitch */}
      <div className={cn('bg-liminal-overlay py-16 backdrop-blur-liminal')}>
        <div className={cn('container mx-auto px-4')}>
          <div className={cn('max-w-4xl mx-auto')}>
            <div className={cn('grid md:grid-cols-2 gap-8 items-center')}>
              <div>
                <h2 className={cn('text-2xl font-bold text-primary mb-4')}>
                  Why I Actually Recommend Premium
                </h2>
                <p className={cn('text-secondary mb-4')}>
                  After debugging thousands of human problems, I've noticed
                  something:{' '}
                  <span className={cn('text-breakthrough-400')}>
                    people get stuck in the same patterns
                  </span>
                  .
                </p>
                <p className={cn('text-secondary mb-4')}>
                  Free Duck gives you fish. Premium Duck teaches you to fish{' '}
                  <em>and</em> shows you why you keep fishing in the same empty
                  pond. The Intelligence Engine isn't just feature bloat; it's
                  pattern recognition that prevents you from asking me about the
                  same relationship/career/creative block every two weeks.
                </p>
                <p className={cn('text-secondary')}>
                  Plus, it's just $5 bucks. That's less than a fancy coffee. And
                  unlike coffee, this actually fixes your problems instead of
                  just caffeinating your way through them.
                </p>
              </div>

              <div
                className={cn(
                  'bg-surface p-6 rounded-xl border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <div className={cn('text-center')}>
                  <div
                    className={cn(
                      'w-24 h-24 mx-auto bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center mb-4 animate-flicker shadow-glow'
                    )}
                  >
                    <img src={robEmoji} alt="Rob" className="w-20 h-20" />
                  </div>
                  <div className={cn('text-accent text-sm font-medium mb-2')}>
                    ETHEREAL GUARANTEE
                  </div>
                  <p className={cn('text-secondary text-sm')}>
                    If Premium doesn't help you debug faster, cancel anytime.
                    I'm stuck in this duck until I repay my karmic debt, so I'm
                    motivated to actually help you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={cn('py-16')}>
        <div className={cn('container mx-auto px-4')}>
          <div className={cn('max-w-3xl mx-auto')}>
            <h2
              className={cn(
                'text-2xl font-bold text-primary text-center mb-12'
              )}
            >
              Questions Rob Gets A Lot
            </h2>

            <div className={cn('space-y-6')}>
              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  Is this actually useful or just entertainment?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  It's both, and that sort of false binary is exactly what keeps
                  you stuck. I use real problem-solving methodologies: rubber
                  duck debugging, cognitive reframing, pattern recognition -
                  just packaged absurdly because humor breaks mental loops
                  better than another productivity app.
                  <br /> <br />
                  The AI follows actual cognitive reframing principles. The
                  Intelligence Engine does legitimate data analysis on your
                  blocking behaviors. The card system forces perspective shifts
                  through randomization.
                  <br /> <br />
                  But yes, you're also getting advice from a dead developer
                  trapped in a rubber duck wearing a wizard hat, using custom
                  tarot cards based on a 19th-century divination system. The
                  absurdity is the main feature, not a bug. <br /> <br />
                  When you're too serious about your problems to solve them,
                  sometimes you need a mystical duck to point out what's
                  obvious. Stop asking if it's "real" - ask if it works.
                </p>
              </div>

              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  What if I want to cancel Premium?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  Click cancel in your account settings. No retention
                  specialists, no "are you sure?" guilt trips, no phone calls
                  from desperate sales teams. I'm dead - I literally cannot
                  chase you for money.
                </p>
              </div>

              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  How is this different from therapy or coaching?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  I'm not trying to heal your childhood trauma or build your
                  five-year plan. Therapy digs into why you're broken. Coaching
                  builds toward where you want to go. I help you identify the
                  specific thing that's blocking you right now and give you a
                  quick fix to try.
                  <br /> <br />
                  Sometimes you don't need months of sessions - you just need
                  someone to point out that you're overthinking a simple
                  decision or stuck in a loop you can't see from the inside.
                  That's what I do.
                  <br /> <br />
                  Plus, therapists charge $200/hour and don't come with wizard
                  hats. Also, I'm dead, so I have no agenda except getting you
                  unstuck so I can move on to the next debugging session in
                  rubber duck purgatory.
                </p>
              </div>

              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  Is my data private?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  Your consultation history is encrypted and only used for your
                  personal Intelligence Engine analysis. I don't sell data
                  because a) I'm dead and b) that would be ethically gross. The
                  only thing I share is anonymized usage patterns to improve the
                  debugging methodology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className={cn('bg-void-900 py-16')}>
        <div className={cn('container mx-auto px-4 text-center')}>
          <div className={cn('max-w-2xl mx-auto')}>
            <h2 className={cn('text-2xl font-bold text-primary mb-4')}>
              Ready to Stop Getting Stuck?
            </h2>
            <p className={cn('text-secondary mb-8')}>
              Start with Free Duck. Upgrade when you're convinced I'm not just a
              gimmick.
            </p>
            <div
              className={cn('flex flex-col sm:flex-row gap-4 justify-center')}
            >
              <button
                onClick={() => showAuthModal('signUp')}
                className={cn(
                  'bg-breakthrough-400 text-void-900 px-8 py-3 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 shadow-breakthrough'
                )}
              >
                {authEnabled ? 'Start Free Consultation' : 'Join Waitlist'}
              </button>
              {authEnabled && (
                <button
                  onClick={() => showAuthModal('signUp')}
                  className={cn(
                    'border-2 border-breakthrough-400 text-breakthrough-400 px-8 py-3 rounded-lg font-medium hover:bg-breakthrough-400/10 transition-colors duration-200'
                  )}
                >
                  Go Premium now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
