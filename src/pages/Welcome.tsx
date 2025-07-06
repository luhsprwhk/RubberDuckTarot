import { Link } from 'react-router-dom';
import robEmoji from '@/src/assets/rob-emoji.png';

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-breakthrough-400/20 to-void-950/80 px-4 py-16">
      <div className="max-w-lg w-full bg-surface/80 rounded-2xl shadow-glow border border-liminal-border p-8 text-center backdrop-blur-liminal">
        <div className="flex flex-col items-center mb-6">
          <img
            src={robEmoji}
            alt="Rubber Duck Mascot"
            className="w-24 h-24 mb-4 animate-flicker"
          />
          <h1 className="text-3xl font-bold text-primary mb-2">
            You’re on the List!
          </h1>
          <p className="text-accent text-lg mb-2">
            The spirits have received your request.
          </p>
        </div>
        <p className="text-secondary mb-4">
          We’ll notify you as soon as your invitation to Rubber Duck Tarot is
          ready.
          <br />
          In the meantime, keep your aura clear and your rubber duck handy.
        </p>
        <Link
          to="/"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-breakthrough-400 text-void-900 font-semibold shadow-glow hover:bg-breakthrough-300 transition-colors"
        >
          Return Home
        </Link>
        <div className="mt-8 text-sm text-liminal-500">
          Questions?{' '}
          <a
            href="mailto:rob@rubberducktarot.com"
            className="underline hover:text-accent"
          >
            rob@rubberducktarot.com
          </a>
        </div>
      </div>
    </div>
  );
}
