import {
  Brain,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  Shuffle,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import Footer from '@/src/components/Footer';
import useAuth from '@/src/lib/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isWaitlistEnabled } from '@/src/lib/featureFlags';
import robEmoji from '@/src/assets/rob-emoji.png';
import featuresHero from '@/src/assets/features-hero.png';

const Features = () => {
  const { showAuthModal } = useAuth();
  const navigate = useNavigate();
  const authEnabled = isWaitlistEnabled();

  return (
    <>
      <div className="min-h-screen bg-void-gradient">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-80 h-80 mx-auto flex items-center justify-center mb-8 shadow-glow animate-flicker">
                <img
                  src={featuresHero}
                  alt="Rubber Duck"
                  className="w-full h-full object-cover"
                />
              </div>

              <h1 className="text-5xl font-bold text-primary mb-4 leading-tight">
                Debugging Tools for Humans
              </h1>
              <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
                Drowned at a Halloween party for a startup that raised $12M to
                gamify dog food and got stuck in this rubber duck. Now I help
                you debug your life problems with the same logic I used for
                code, just with more wizard hat energy.
              </p>
            </div>
          </div>

          {/* Rob's Commentary */}
          <div className="bg-liminal-overlay py-8 backdrop-blur-liminal">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto bg-surface p-6 rounded-xl border border-liminal-border backdrop-blur-liminal">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-breakthrough-400 to-breakthrough-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                    <img src={robEmoji} alt="Rob" className="w-16 h-16" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Why This Actually Works
                    </h3>
                    <p className="text-secondary text-sm leading-relaxed">
                      Most apps give you more ways to organize your anxiety. I
                      give you{' '}
                      <span className="text-breakthrough-400">
                        pattern interrupts
                      </span>{' '}
                      that break mental loops. These aren't mystical fortune
                      cards—they're debugging tools disguised as entertainment.
                      When you're stuck, you need perspective shifts, not more
                      productivity frameworks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Perspective Cards Feature */}
          <div className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Left column: Perspective Cards Explanation */}
                  <div id="perspective-cards">
                    <div className="flex items-center gap-3 mb-6">
                      <Shuffle className="w-12 h-12 text-breakthrough-400" />
                      <h2 className="text-3xl font-bold text-primary">
                        Perspective Cards
                      </h2>
                    </div>
                    <h3 className="text-xl text-accent mb-4">
                      33 Debugging Tools for Modern Problems
                    </h3>
                    <p className="text-secondary mb-6 leading-relaxed">
                      Forget mystical nonsense. These cards represent real
                      situations you deal with: Charging Cable (tangled
                      complexity), Weather App (uncertainty), Delete Button
                      (decisive cuts). Each card triggers perspective shifts
                      that break you out of mental loops.
                    </p>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-primary">
                            Pattern Interrupt Technology
                          </div>
                          <div className="text-sm text-secondary">
                            Breaks analysis paralysis with lateral thinking
                            prompts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-primary">
                            Context-Aware Reframing
                          </div>
                          <div className="text-sm text-secondary">
                            Cards adapt to your specific block type and
                            situation
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-primary">
                            Multiple Consultation Modes
                          </div>
                          <div className="text-sm text-secondary">
                            Quick Duck (1 card) & Full Pond (3 cards)
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-breakthrough-500/10 p-4 rounded-lg border border-breakthrough-500/30">
                      <p className="text-secondary text-sm italic">
                        "I built these after debugging thousands of problems.
                        Turns out most blocks follow predictable patterns— you
                        just need the right metaphor to see the solution."
                      </p>
                      <div className="text-breakthrough-400 text-xs mt-2">
                        — Rob Chen, Senior Ethereal Consultant
                      </div>
                    </div>
                  </div>
                  {/* Right column: Example Consultations stacked */}
                  <div className="flex flex-col gap-8">
                    <div className="bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                      <div className="text-center mb-6">
                        <div className="text-breakthrough-400 text-sm font-medium mb-2">
                          EXAMPLE CONSULTATION
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          "Talking to family feels like I'm stuck in a fog"
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-void-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-breakthrough-400/20 rounded flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-breakthrough-400" />
                            </div>
                            <span className="text-sm text-primary">
                              Card Drawn: Airplane
                            </span>
                          </div>
                          <span className="text-xs text-breakthrough-400">
                            Movement, escape, journey, departure
                          </span>
                        </div>
                        <div className="p-4 bg-breakthrough-500/10 rounded-lg border border-breakthrough-500/30">
                          <div className="text-breakthrough-400 text-xs font-medium mb-2">
                            ROB'S REFRAME
                          </div>
                          <div className="text-sm text-secondary mb-3">
                            You're trying to navigate with broken GPS when you
                            need to pick a destination first. Stop planning the
                            perfect conversation and decide where you actually
                            want this relationship to go
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted mt-4">
                        <strong>Action prompt: </strong>
                        Choose one specific thing you want from your family
                        relationship. Have that conversation this week, not the
                        perfect one you've been rehearsing.
                      </div>
                    </div>
                    <div className="bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                      <div className="text-center mb-6">
                        <div className="text-breakthrough-400 text-sm font-medium mb-2">
                          EXAMPLE CONSULTATION
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          Should I quit my stable job to freelance?
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-void-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-breakthrough-400/20 rounded flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-breakthrough-400" />
                            </div>
                            <span className="text-sm text-primary">
                              Card Drawn: Portable Charger
                            </span>
                          </div>
                          <span className="text-xs text-breakthrough-400">
                            Backup power, preparation, emergency resources
                          </span>
                        </div>
                        <div className="p-4 bg-breakthrough-500/10 rounded-lg border border-breakthrough-500/30">
                          <div className="text-breakthrough-400 text-xs font-medium mb-2">
                            ROB'S REFRAME
                          </div>
                          <div className="text-sm text-secondary mb-3">
                            You're planning a road trip without checking if you
                            have a spare tire. Build your freelance foundation
                            while you still have steady income. What's your
                            safety net if things go wrong?
                          </div>
                        </div>
                        <div className="text-xs text-muted mt-4">
                          <strong>Action prompt: </strong>
                          Set a specific savings target and timeline. Start
                          freelancing on weekends until you have 6 months of
                          expenses saved.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Intelligence Engine Feature */}
        <div className="bg-liminal-overlay py-16 backdrop-blur-liminal">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                    <div className="text-center mb-6">
                      <div className="text-breakthrough-400 text-sm font-medium mb-2">
                        PATTERN ANALYSIS
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        Rob's Intelligence Report
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-void-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">
                            Your Top Block Type
                          </span>
                          <span className="text-xs text-breakthrough-400">
                            Decision Paralysis
                          </span>
                        </div>
                        <div className="text-xs text-secondary">
                          You ask me about the same career choice every 3 weeks
                        </div>
                      </div>

                      <div className="p-4 bg-void-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">
                            Most Effective Card
                          </span>
                          <span className="text-xs text-breakthrough-400">
                            Airplane (78% success)
                          </span>
                        </div>
                        <div className="text-xs text-secondary">
                          Movement metaphors consistently unblock you
                        </div>
                      </div>

                      <div className="p-4 bg-breakthrough-500/10 rounded-lg border border-breakthrough-500/30">
                        <div className="text-breakthrough-400 text-xs font-medium mb-2">
                          ROB'S INTERVENTION
                        </div>
                        <div className="text-sm text-secondary">
                          "Stop asking if you should quit your job. You've asked
                          12 times. The real question is: what's one small step
                          toward your side business you could take this week?"
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted">Free: Last 7 days</span>
                        <span className="text-breakthrough-400">
                          Premium: Full history + predictions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-12 h-12 text-breakthrough-400" />
                    <h2 className="text-3xl font-bold text-primary">
                      Intelligence Engine
                    </h2>
                  </div>

                  <h3 className="text-xl text-accent mb-4">
                    Rob Learns Your Patterns (So You Stop Repeating Them)
                  </h3>

                  <p className="text-secondary mb-6 leading-relaxed">
                    Humans ask the same question 50 different ways. The
                    Intelligence Engine spots when you're stuck in loops and
                    gives you pattern-breaking insights. It's like having a
                    debugging consultant who actually remembers what you talked
                    about last session.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Loop Detection
                        </div>
                        <div className="text-sm text-secondary">
                          Identifies when you're asking the same question with
                          different words
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Success Pattern Analysis
                        </div>
                        <div className="text-sm text-secondary">
                          Learns which cards and approaches actually work for
                          your brain
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Smart Recommendations
                        </div>
                        <div className="text-sm text-secondary">
                          Suggests "Skip the reading" shortcuts when patterns
                          are obvious
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/50 p-4 rounded-lg border border-liminal-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-breakthrough-400 text-void-900 px-2 py-1 rounded font-medium">
                        FREE
                      </span>
                      <span className="text-sm text-primary">
                        Basic pattern insights (7 days)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-accent text-void-900 px-2 py-1 rounded font-medium">
                        PREMIUM
                      </span>
                      <span className="text-sm text-primary">
                        Full history + predictive analysis + Rob's monthly
                        reports
                      </span>
                    </div>
                  </div>

                  <div className="bg-breakthrough-500/10 p-4 rounded-lg border border-breakthrough-500/30 mt-4">
                    <p className="text-secondary text-sm italic">
                      "Free users get enough intelligence to see the value.
                      Premium users get the full debugging consultant
                      experience. I'm not holding back the good stuff—I'm just
                      letting you upgrade when you're ready."
                    </p>
                    <div className="text-breakthrough-400 text-xs mt-2">
                      — Rob Chen, Freemium Ghost
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Block Tracker Feature */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-12 h-12 text-breakthrough-400" />
                    <h2 className="text-3xl font-bold text-primary">
                      Block Tracker
                    </h2>
                  </div>

                  <h3 className="text-xl text-accent mb-4">
                    Transform Getting Stuck from Shame into Data
                  </h3>

                  <p className="text-secondary mb-6 leading-relaxed">
                    Most people abandon projects when they hit walls. The Block
                    Tracker shows you that getting stuck is normal debugging
                    behavior, not personal failure. Track your blocks, spot
                    patterns, and celebrate actually solving problems instead of
                    avoiding them.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Normalize the Struggle
                        </div>
                        <div className="text-sm text-secondary">
                          Getting stuck becomes data points, not character flaws
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Resolution Velocity Tracking
                        </div>
                        <div className="text-sm text-secondary">
                          See how you're getting better at solving problems over
                          time
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Block Type Analysis
                        </div>
                        <div className="text-sm text-secondary">
                          Identify whether you struggle more with creative,
                          decision, or work blocks
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface/50 p-4 rounded-lg border border-liminal-border mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-breakthrough-400 text-void-900 px-2 py-1 rounded font-medium">
                        FREE
                      </span>
                      <span className="text-sm text-primary">
                        Current week tracking + basic stats
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-accent text-void-900 px-2 py-1 rounded font-medium">
                        PREMIUM
                      </span>
                      <span className="text-sm text-primary">
                        Full history + trend analysis + breakthrough
                        celebrations
                      </span>
                    </div>
                  </div>

                  <div className="bg-breakthrough-500/10 p-4 rounded-lg border border-breakthrough-500/30">
                    <p className="text-secondary text-sm italic">
                      "I spent years being ashamed of getting stuck instead of
                      tracking it like any other debugging process. This feature
                      would have shown me I was actually getting better at
                      solving problems."
                    </p>
                    <div className="text-breakthrough-400 text-xs mt-2">
                      — Rob Chen, Reformed Perfectionist
                    </div>
                  </div>
                </div>

                <div className="bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                  <div className="text-center mb-6">
                    <div className="text-breakthrough-400 text-sm font-medium mb-2">
                      YOUR DEBUGGING STATS
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      This Month's Progress
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-void-800/50 rounded-lg">
                      <span className="text-sm text-primary">
                        Blocks Resolved
                      </span>
                      <span className="text-breakthrough-400 font-semibold">
                        8/10
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-void-800/50 rounded-lg">
                      <span className="text-sm text-primary">
                        Average Resolution Time
                      </span>
                      <span className="text-breakthrough-400 font-semibold">
                        2.3 days
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-void-800/50 rounded-lg">
                      <span className="text-sm text-primary">
                        Personal Best
                      </span>
                      <span className="text-breakthrough-400 font-semibold">
                        6 hours
                      </span>
                    </div>

                    <div className="p-4 bg-breakthrough-500/10 rounded-lg border border-breakthrough-500/30">
                      <div className="text-breakthrough-400 text-xs font-medium mb-2">
                        ACHIEVEMENT UNLOCKED
                      </div>
                      <div className="text-sm text-secondary mb-2">
                        🏆 <strong>Pattern Breaker:</strong> Solved same block
                        type 3x faster than last month
                      </div>
                      <div className="text-xs text-muted">
                        You're getting noticeably better at creative blocks.
                        Nice work.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat with Rob Feature */}
        <div className="bg-liminal-overlay py-16 backdrop-blur-liminal">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left column — explanation */}
                <div id="chat-with-rob">
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-12 h-12 text-breakthrough-400" />
                    <h2 className="text-3xl font-bold text-primary">
                      Chat with Rob
                    </h2>
                  </div>

                  <h3 className="text-xl text-accent mb-4">
                    Your On-Demand Perspective Debugger
                  </h3>

                  <p className="text-secondary mb-6 leading-relaxed">
                    Rob is a ghostly developer trapped in a rubber duck. He
                    remembers every card you've drawn, every block you've
                    tracked, and every action you did (or didn't). Open the chat
                    and you get a context-aware partner who talks you through
                    the problem until the bug in your thinking surfaces.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Instant Context
                        </div>
                        <div className="text-sm text-secondary">
                          Rob skims your entire Duck History before he says "hi,
                          " so you never have to re-explain the issue.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Debugging, Not Therapy
                        </div>
                        <div className="text-sm text-secondary">
                          He treats feelings like stack-traces and assumptions
                          like legacy code—kind, but surgically honest.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-breakthrough-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-primary">
                          Perspective on Demand
                        </div>
                        <div className="text-sm text-secondary">
                          One message can trigger a fresh card draw, a pattern
                          lookup, or straight tactical advice.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-breakthrough-500/10 p-4 rounded-lg border border-breakthrough-500/30">
                    <p className="text-secondary text-sm italic">
                      Say the risky idea out loud; I'll just step through it
                      until the logic holds.
                    </p>
                    <div className="text-breakthrough-400 text-xs mt-2">
                      Rob Chen, Ethereal Consultant
                    </div>
                  </div>
                </div>

                {/* Right column \u2013 example chats */}
                <div className="flex flex-col gap-8">
                  {/* Example 1 \u2013 Reclaiming Work Despite Health */}
                  <div className="bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                    <div className="text-center mb-6">
                      <div className="text-breakthrough-400 text-sm font-medium mb-2">
                        EXAMPLE CHAT
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        Reclaiming Work Despite Health
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-breakthrough-500/10 rounded-lg border border-breakthrough-500/30">
                        <div className="text-breakthrough-400 text-xs font-medium mb-2">
                          ROB'S RETHINK
                        </div>
                        <div className="text-sm text-secondary mb-3">
                          Recovery isn't linear—some days you're running at full
                          CPU, other days you're in power-saving mode. Let's map
                          tomorrow's tasks to the energy you'll realistically
                          have.
                        </div>
                      </div>

                      <div className="text-xs text-muted">
                        <strong>Action prompt:</strong> Match tomorrow's tasks
                        to your expected energy level (full CPU vs
                        power-saving).
                      </div>
                    </div>
                  </div>

                  {/* Example 2 \u2013 Friday time-crunch feature */}
                  <div className="bg-surface p-8 rounded-xl border border-liminal-border backdrop-blur-liminal">
                    <div className="text-center mb-6">
                      <div className="text-breakthrough-400 text-sm font-medium mb-2">
                        EXAMPLE CHAT
                      </div>
                      <div className="text-lg font-semibold text-primary">
                        "My manager just slapped a 'quick' feature on Friday's
                        release..."
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-breakthrough-500/10 rounded-lg border border-breakthrough-500/30">
                        <div className="text-breakthrough-400 text-xs font-medium mb-2">
                          ROB'S RETHINK
                        </div>
                        <div className="text-sm text-secondary mb-3">
                          Friday is 36 hours away. Let's open your
                          <strong> Portable Charger</strong>: which backup task
                          can you postpone to free up four focused hours?
                        </div>
                      </div>

                      <div className="text-xs text-muted">
                        <strong>Action prompt:</strong> Reschedule a
                        non-essential task to next week and block four hours for
                        the new feature.
                      </div>
                    </div>
                  </div>
                </div>
                {/* End right column */}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Ready to Debug Your Life Problems?
              </h2>
              <p className="text-xl text-secondary mb-8">
                All features are free with limits. Perspective Cards, basic
                Intelligence Engine, and Block Tracker are available
                immediately. Premium removes limits and adds advanced pattern
                analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => showAuthModal('signUp')}
                  className="cursor-pointer bg-breakthrough-400 text-void-900 px-8 py-4 rounded-lg font-semibold hover:bg-breakthrough-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-breakthrough"
                >
                  {authEnabled ? 'Start Free' : 'Join Waitlist'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="cursor-pointer border-2 border-breakthrough-400 text-breakthrough-400 px-8 py-4 rounded-lg font-medium hover:bg-breakthrough-400/10 transition-colors duration-200"
                >
                  View Pricing
                </button>
              </div>
              <p className="text-sm text-muted mt-4">
                * Premium removes limits and adds advanced features ($5/month)
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Features;
