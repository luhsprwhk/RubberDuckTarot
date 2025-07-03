import React from 'react';
import { Link } from 'react-router-dom';
import robEmoji from '@/src/assets/rob-emoji.png';

interface ErrorStateProps {
  error: string;
  homeLinkText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  homeLinkText = 'Go to Home Page',
}) => (
  <div className="max-w-4xl mx-auto p-6 min-h-screen">
    <div className="text-center bg-surface p-6 rounded-xl border border-liminal-border backdrop-blur-liminal">
      <div className="mb-4">
        <img src={robEmoji} alt="Rob" className="w-16 h-16 mx-auto" />
      </div>
      <h2 className="text-2xl font-semibold text-primary mb-4">
        Oops! Something went wrong
      </h2>
      <p className="text-accent mb-6">{error}</p>
      <Link
        to="/"
        className="px-6 py-2 bg-breakthrough-400 text-void-900 font-medium rounded-lg hover:bg-breakthrough-300 transition-colors"
      >
        {homeLinkText}
      </Link>
    </div>
  </div>
);

export default ErrorState;
