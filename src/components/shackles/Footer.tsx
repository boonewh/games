import Image from 'next/image';
import Link from 'next/link';

export default function SkullShacklesFooter() {
  return (
    <footer className="w-full">
      <hr className="border-[#c6c4ba]" />
      
      <div className="flex bg-[#9d9b9c] text-[#30393e] justify-center items-center clear-both">
        <Link 
          href="/shackles" 
          className="text-[#30393e] text-[1.3em] leading-[1.6em] no-underline"
        >
          Back to Top
        </Link>
        
        <Image 
          src="/images/shackles/flagfill.png" 
          alt="pirate flag" 
          width={240}
          height={160}
          className="w-[20%] lg:w-auto lg:mx-10 lg:my-5 mx-[5px] my-[5px]"
        />
        
        <p className="text-[#30393e]">All Rights Reserved</p>
      </div>
      
      <div className="flex bg-[#9d9b9c] text-[#30393e] justify-center font-['Alkatra',Arial,Helvetica,sans-serif]">
        <Link 
          href="https://www.pathsixdesigns.com" 
          className="text-[#30393e] text-[1.3em] leading-[1.6em] no-underline"
        >
          PathSix Web Design
        </Link>
      </div>
    </footer>
  );
}