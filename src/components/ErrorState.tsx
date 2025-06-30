import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  error: string;
  homeLinkText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  homeLinkText = 'Go to Home Page',
}) => (
  <div className="max-w-4xl mx-auto p-6 bg-void-gradient min-h-screen">
    <div className="text-center">
      <div className="text-6xl mb-4">🦆</div>
      <h2 className="text-2xl font-semibold text-red-600 mb-4">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-700 mb-6">{error}</p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        {homeLinkText}
      </Link>
    </div>
  </div>
);

export default ErrorState;
