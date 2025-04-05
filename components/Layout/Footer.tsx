import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-500 mt-auto">
      <div className="container mx-auto p-4">
        <p className="text-center text-white">
          &copy; {new Date().getFullYear()} WiFi Signal Simulator | Built with Next.js
        </p>
      </div>
    </footer>
  );
};

export default Footer;