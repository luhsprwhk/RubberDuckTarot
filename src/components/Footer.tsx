import React from 'react';

const Footer: React.FC = () => (
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
);

export default Footer;
