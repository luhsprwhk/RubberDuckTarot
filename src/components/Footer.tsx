import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <div className="flex flex-col sm:flex-row text-center items-center justify-center gap-2 mt-4 p-4 bg-black text-muted">
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
    <div className="flex gap-4 text-sm">
      <Link to="/privacy" className="hover:underline text-accent">
        Privacy
      </Link>
      <Link to="/terms" className="hover:underline text-accent">
        Terms
      </Link>
    </div>
  </div>
);

export default Footer;
