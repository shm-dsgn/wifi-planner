import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-100 mt-auto">
      <div className="container mx-auto p-4 flex gap-2 justify-center items-center">
        <p className="text-center">
          &copy; {new Date().getFullYear()} WiFi Planner | Built with 
        </p>
        <Image src="/next.svg" alt="Next.js Logo" width={64} height={64} color='#fff'/>
      </div>
    </footer>
  );
};

export default Footer;