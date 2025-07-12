import { Check, X, Zap, Crown, Ghost, ArrowRight } from 'lucide-react';
import Footer from '@/src/components/Footer';
import useAuth from '@/src/lib/hooks/useAuth';
import { cn } from '@/src/lib/utils';
import upgradeHero from '@/src/assets/upgrade-hero.png';
import robEmoji from '@/src/assets/rob-emoji.png';
import { isWaitlistEnabled } from '@/src/lib/featureFlags';

const Upgrade = () => {
  const { showAuthModal } = useAuth();
  const waitlistEnabled = isWaitlistEnabled();

  return (
    <div className={cn('min-h-screen bg-void-gradient')}>
      {/* Hero Section */}
      <div className={cn('container mx-auto px-4 pt-16')}>
        <div className={cn('text-center max-w-4xl mx-auto')}>
          <div className={cn('mb-8')}>
            <div
              className={cn(
                'w-80 h-80 mx-auto',
                'flex items-center justify-center mb-4 relative'
              )}
            >
              <div
                id="upgrade-banner"
                className={cn(
                  'w-80 h-80 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500',
                  'flex items-center justify-center animate-pulse-glow shadow-glow'
                )}
              >
                <img
                  src={upgradeHero}
                  alt="Rubber Duck"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={cn(
                  'absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full',
                  'flex items-center justify-center animate-flicker'
                )}
              >
                <Crown className={cn('w-5 h-5 text-void-900')} />
              </div>
            </div>
          </div>

          <h1
            className={cn('text-5xl font-bold text-primary mb-4 leading-tight')}
          >
            Upgrade to Premium Duck
          </h1>
          <p className={cn('text-xl text-secondary mb-8 max-w-2xl mx-auto')}>
            I died avoiding a startup pitch about "synergistic revenue
            optimization." Now I'm stuck helping people debug their lives. The
            least you can do is upgrade so we both avoid ads.
          </p>
        </div>
      </div>

      {/* Rob's Pitch */}
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
                  Rob's Honest Upgrade Pitch
                </h3>
                <p className={cn('text-secondary text-sm leading-relaxed')}>
                  Look, I spent 25 years watching people pay for "premium
                  experiences" that were basically the same product with fewer
                  interruptions. This is exactly that, and{' '}
                  <span className={cn('text-breakthrough-400')}>
                    I'm being completely upfront about it
                  </span>
                  .
                  <br /> <br />
                  Free Duck works great for occasional debugging. Premium Duck
                  removes friction and adds depth. It's like the difference
                  between using a public terminal and having your own
                  development environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
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
                  Your Current Plan
                </h3>
                <div className={cn('text-3xl font-bold text-primary mb-1')}>
                  $0
                </div>
                <div className={cn('text-muted text-sm')}>
                  forever (ad-supported)
                </div>
              </div>

              <div className={cn('mb-8')}>
                <div
                  className={cn(
                    'bg-void-800/50 p-4 rounded-lg border border-void-600 mb-6'
                  )}
                >
                  <p className={cn('text-secondary text-sm italic')}>
                    "You get everything with reasonable limits. Perfect for
                    occasional debugging sessions."
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
                      <strong>7 insights per day</strong>
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Basic Intelligence Engine</strong> (7 days)
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Check
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Current week tracking</strong>
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <X className={cn('w-5 h-5 text-muted flex-shrink-0')} />
                    <span className={cn('text-muted text-sm')}>
                      Ads after consultations
                    </span>
                  </li>
                </ul>
              </div>
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
                RECOMMENDED
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
                  $5
                </div>
                <div className={cn('text-muted text-sm')}>
                  per month (no ads)
                </div>
              </div>

              <div className={cn('mb-8')}>
                <div
                  className={cn(
                    'bg-breakthrough-500/10 p-4 rounded-lg border border-breakthrough-500/30 mb-6'
                  )}
                >
                  <p className={cn('text-secondary text-sm italic')}>
                    "Everything unlimited, plus advanced features that help you
                    debug patterns, not just symptoms."
                  </p>
                </div>

                <div
                  className={cn(
                    'text-breakthrough-400 text-sm font-medium mb-3'
                  )}
                >
                  Everything Unlimited + Advanced Features:
                </div>
                <ul className={cn('space-y-3')}>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Unlimited daily consultations</strong>
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Full Intelligence Engine</strong> + predictive
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
                      <strong>Complete history archive</strong>
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Premium Rob features</strong> + weekly check-ins
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Export capabilities</strong>
                    </span>
                  </li>
                  <li className={cn('flex items-center gap-3')}>
                    <Zap
                      className={cn(
                        'w-5 h-5 text-breakthrough-400 flex-shrink-0'
                      )}
                    />
                    <span className={cn('text-secondary text-sm')}>
                      <strong>Ad-free forever</strong>
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
                {waitlistEnabled ? 'Upgrade to Premium' : 'Join Waitlist'}
                <ArrowRight className={cn('w-5 h-5')} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Premium Section */}
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
                  Plus, it's five bucks. That's less than a fancy coffee. And
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
              Questions About Premium
            </h2>

            <div className={cn('space-y-6')}>
              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  What exactly am I paying for?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  No usage limits, no ads, full pattern analysis, complete
                  history, and advanced debugging features. Think of it as the
                  difference between using the community version of a developer
                  tool and having the full professional license.
                </p>
              </div>

              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  Can I cancel anytime?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  Click cancel in your account settings. No retention
                  specialists, no "are you sure?" guilt trips. I'm dead - I
                  literally cannot chase you for money or hold your data
                  hostage.
                </p>
              </div>

              <div
                className={cn(
                  'bg-surface p-6 rounded-lg border border-liminal-border backdrop-blur-liminal'
                )}
              >
                <h3 className={cn('text-lg font-semibold text-primary mb-2')}>
                  Is this just the free version without ads?
                </h3>
                <p className={cn('text-secondary text-sm')}>
                  No ads is part of it, but the real value is unlimited access
                  and the advanced Intelligence Engine. Free gives you 7 daily
                  consultations and basic pattern detection. Premium removes all
                  limits and adds deep historical analysis, trend prediction,
                  and export capabilities.
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
              Ready to Debug Without Limits?
            </h2>
            <p className={cn('text-secondary mb-8')}>
              Stop hitting daily consultation limits right when you're making
              breakthrough progress. Upgrade and debug properly.
            </p>
            <div
              className={cn('flex flex-col sm:flex-row gap-4 justify-center')}
            >
              <button
                onClick={() => showAuthModal('signUp')}
                className={cn(
                  'cursor-pointer bg-breakthrough-400 text-void-900 px-8 py-3 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 shadow-breakthrough'
                )}
              >
                {waitlistEnabled
                  ? 'Upgrade to Premium - $4.99/month'
                  : 'Join Waitlist'}
              </button>
            </div>
            <p className={cn('text-muted text-sm mt-4')}>
              Cancel anytime. No contracts. I'm a ghost, not a subscription
              vampire.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Upgrade;
