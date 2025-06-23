import {
  Crown,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  Check,
} from 'lucide-react';

const Upgrade = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-4xl animate-bounce">
                🦆
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Premium Duck
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Look, I died avoiding a startup pitch. Now I'm stuck helping people
            debug their lives. The least you can do is upgrade so I don't have
            to show you ads.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Duck */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🦆</div>
              <h3 className="text-2xl font-bold mb-2">Free Duck</h3>
              <div className="text-3xl font-bold text-gray-300">
                $0<span className="text-lg">/month</span>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Unlimited consultations
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Personalized insights
              </li>
              <li className="flex items-center">
                <span className="text-yellow-400 mr-3">⚠️</span>
                Ads after consultations
              </li>
              <li className="flex items-center">
                <span className="text-yellow-400 mr-3">❌</span>
                No history
              </li>
            </ul>
          </div>

          {/* Premium Duck */}
          <div className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-sm rounded-xl p-8 border-2 border-yellow-400 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                RECOMMENDED
              </span>
            </div>
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">👑🦆</div>
              <h3 className="text-2xl font-bold mb-2">Premium Duck</h3>
              <div className="text-3xl font-bold text-yellow-400">
                $2.99<span className="text-lg">/month</span>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-600 mr-3">
                  <Check />
                </span>
                <strong>Everything in free duck plus:</strong>
              </li>
              <li className="flex items-center">
                <span className="text-yellow-400 mr-3">✨</span>
                <strong>No ads ever</strong>
              </li>
              <li className="flex items-center">
                <span className="text-yellow-400 mr-3">✨</span>
                <strong>Complete history archive</strong>
              </li>
            </ul>
            <button className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-bold py-3 px-6 rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105">
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* Rob's Sales Pitch */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 max-w-4xl mx-auto mb-16">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">🦆🎩</div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-yellow-400">
                Rob's Honest Sales Pitch
              </h3>
              <div className="space-y-4 text-gray-200 leading-relaxed">
                <p>
                  Look, I spent 20+ years building other people's dreams while
                  mine collected dust on GitHub. Now I'm stuck in this rubber
                  duck helping you debug your life mistakes.
                </p>
                <p>
                  The free version works fine if you just want random
                  perspective shifts. But if you're serious about actually
                  getting unstuck? Premium gives you the full debugging
                  experience I wish I'd had when I was alive.
                </p>
                <p>
                  Three bucks a month is cheaper than one overpriced startup
                  coffee. And unlike that latte, this might actually solve your
                  problems instead of just masking your exhaustion.
                </p>
                <p className="font-semibold text-yellow-400">
                  Plus, no ads means I don't have to watch you get pitched the
                  same crypto nonsense that was playing when I died. We both
                  win.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Features Deep Dive */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Brain className="w-8 h-8 text-purple-400 mr-3" />
              <h4 className="text-lg font-bold">Rob's Intelligence Engine</h4>
            </div>
            <p className="text-gray-300">
              I analyze your blocking patterns and give you personalized
              insights. Think of it as performance profiling for your life
              decisions.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-yellow-400 mr-3" />
              <h4 className="text-lg font-bold">Unlimited Debugging</h4>
            </div>
            <p className="text-gray-300">
              No daily limits on consultations. When you're in a debugging loop,
              you need as many attempts as it takes to break through.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-8 h-8 text-green-400 mr-3" />
              <h4 className="text-lg font-bold">Pattern Recognition</h4>
            </div>
            <p className="text-gray-300">
              I track what actually unblocks you vs. what you think should work.
              Data-driven self-improvement from beyond the grave.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-blue-400 mr-3" />
              <h4 className="text-lg font-bold">Full History Archive</h4>
            </div>
            <p className="text-gray-300">
              Keep all your consultations forever. Because sometimes the answer
              you need was in a reading from three months ago.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 text-pink-400 mr-3" />
              <h4 className="text-lg font-bold">Full Pond Spreads</h4>
            </div>
            <p className="text-gray-300">
              5-card deep dives for complex problems. When your block needs
              architectural refactoring, not just a quick patch.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <Crown className="w-8 h-8 text-yellow-400 mr-3" />
              <h4 className="text-lg font-bold">No Ads, Ever</h4>
            </div>
            <p className="text-gray-300">
              I died avoiding startup pitches. Premium users get pure debugging
              without cryptocurrency ads or productivity guru nonsense.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm rounded-xl p-8 border border-purple-400 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Ready to debug properly?
            </h3>
            <p className="text-gray-300 mb-6">
              Stop hitting the same mental walls. Let a dead developer help you
              break through them.
            </p>
            <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-bold py-4 px-8 rounded-lg hover:from-yellow-300 hover:to-orange-300 transition-all transform hover:scale-105 text-lg">
              Upgrade to Premium Duck - $2.99/month
            </button>
            <p className="text-sm text-gray-400 mt-4">
              Cancel anytime. No long-term contracts. I'm dead, not desperate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
