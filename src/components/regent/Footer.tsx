import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#3F110B] text-white py-3">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-sm">
        <Link 
          href="#top" 
          className="hover:text-yellow-300 transition-colors"
        >
          Back to Top
        </Link>
        <span>All Rights Reserved</span>
      </div>
    </footer>
  );
};

export default Footer;