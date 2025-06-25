import { Star, ArrowRight, User, Zap, Target, Shield } from 'lucide-react';
import useAuth from '@/src/hooks/useAuth';

const Landing = () => {
  const { showAuthModal } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Mascot Area */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">🦆</span>
            </div>
            <div className="text-xs text-purple-600 font-medium">
              EST. 2023 * BEYOND THE GRAVE
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Rubber Duck Tarot
            </h1>
            <h2 className="text-blue-600 text-2xl font-semibold">
              Ethereal Debugging Services
            </h2>
          </div>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional problem-solving services from a deceased full-stack
            developer. Now offering perspective debugging from beyond the veil
            with 25+ years of experience in breaking things and fixing them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => showAuthModal('signUp')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Start Free Consultation
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 transition-colors">
              View Case Studies
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.9/5</span>
              <span>ethereal rating</span>
            </div>
            <div>
              <span className="font-medium">1,247</span> souls debugged
            </div>
            <div>
              <span className="font-medium">25+</span> years experience
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Debugging Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Specialized consultation for the living, drawing from hard-won
              experience and the unique perspective that only death can provide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Target className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-3">Decision Debugging</h3>
              <p className="text-gray-600 text-sm">
                Break analysis paralysis with perspective shifts. Having died
                from avoiding decisions, I now help others choose faster.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-3">
                Creative Unblocking
              </h3>
              <p className="text-gray-600 text-sm">
                Overcome creative blocks using proven debugging methodologies.
                Death gives excellent perspective on what actually matters.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <User className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-3">
                Career Consultation
              </h3>
              <p className="text-gray-600 text-sm">
                Navigate professional challenges with insights from someone
                who's seen every tech trend die (and then died himself).
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Shield className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold mb-3">Life Debugging</h3>
              <p className="text-gray-600 text-sm">
                General problem-solving for the complexities of existence.
                Afterlife perspective included at no extra charge.
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Meet Your Consultant
                </h2>
                <p className="text-gray-600 mb-4">
                  Robert Chen (1977-2023) was a full-stack developer with 25+
                  years of experience in breaking things and occasionally fixing
                  them. After drowning at a startup Halloween party while
                  avoiding yet another pitch deck, his soul became permanently
                  bonded to a rubber duck wearing a wizard hat.
                </p>
                <p className="text-gray-600 mb-6">
                  Now operating from beyond the grave, Rob offers debugging
                  services with the unique perspective that only death can
                  provide. His ethereal consultancy focuses on practical
                  problem-solving without the limitations of physical form or
                  corporate politics.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    Full-Stack Development
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Problem Decomposition
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    Afterlife Insights
                  </span>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    Startup Survivor
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-6xl">🦆</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Rob Chen
                  </h3>
                  <p className="text-blue-600 font-medium mb-4">
                    Otherworldly Senior Consultant
                  </p>
                  <div className="text-sm text-gray-600">
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
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Client Testimonials
            </h2>
            <p className="text-gray-600">
              What the living are saying about my otherworldly services
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Rob helped me debug my career in 15 minutes. The perspective
                from someone who's literally beyond caring about office politics
                was exactly what I needed."
              </p>
              <div className="text-sm">
                <div className="font-medium">Sarah K.</div>
                <div className="text-gray-500">Senior Engineer, FinTech</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Finally, a consultant who doesn't try to sell me anything
                because he's literally dead. The advice was brutally honest and
                incredibly helpful."
              </p>
              <div className="text-sm">
                <div className="font-medium">Mike T.</div>
                <div className="text-gray-500">Product Manager, SaaS</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Rob's debugging methodology works for more than just code.
                Helped me fix my entire life stack. 10/10 would consult the
                otherworld again."
              </p>
              <div className="text-sm">
                <div className="font-medium">Alex R.</div>
                <div className="text-gray-500">UX Designer, Startup</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Debug Your Blocks?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start your free consultation with Rubber Duck Tarot. No mystical
              nonsense, just practical problem-solving from beyond the grave.
            </p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
              Begin Free Consultation
            </button>
            <p className="text-sm text-gray-500 mt-4">
              * No seance required. Standard spiritual rates apply.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🦆</span>
            <span className="font-semibold">Rubber Duck Tarot</span>
          </div>
          <p className="text-gray-400 text-sm">
            Professional debugging services from beyond the grave since 2023
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Rob Chen (1977-2023) • Licensed Ethereal Consultant • No returns
            policy (obviously)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
