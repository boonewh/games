'use client';

import React from 'react';
import Image from 'next/image';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-[#EFCAA3]">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content - Takes up 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-red-900 mb-8 text-center lg:text-left">
                About Us
              </h1>
              <section className="space-y-6 text-gray-700 leading-relaxed">
              <h2>Our Table, Our Story</h2>

              <h3>The Beginning — January 1986</h3>
              <p>Five friends gathered for their first session of Dungeons &amp; Dragons together. That night sparked a game and a legacy, one that is still going.</p>

              <h3>Parallel Tables</h3>
              <p>Around the same time, two of those players were also running regular games with friends from school.</p>

              <h3>One Table, Many Friends</h3>
              <p>Eventually members of each group met, and four of them began playing regular D&amp;D sessions together. Over the years many others have come and gone, and we remember them all.</p>

              <h3>Life Between Sessions</h3>
              <p>We’ve known each other a long time. Even the newest members have known someone in the circle for years. We’ve shared marriages, a divorce, job changes, and plenty of highs and lows. So much more than just dice and stories.</p>

              <h3>Finding Our System</h3>
              <p>We played 1st, 2nd, 3rd, and 3.5 editions of D&amp;D. When 4th edition didn’t feel like home, a newer member, still with us 15 years later, introduced Pathfinder. Built on familiar 3.5 bones, it clicked immediately.</p>

              <h3>How We Play Now</h3>
              <p>These days we stick to Pathfinder Adventure Paths and rotate storytellers. Three of us take turns running the adventures, each with our own style.</p>

              <h3>Why We House-Rule</h3>
              <p>If you ever wonder “why?” about a house rule, know that, as a group, we discussed and agreed on each and every one of them. We’ve tuned the game into what we want to play and what we love. And that’s the point, isn&apos;t it?</p>
              </section>

            </div>
          </div>

          {/* Sidebar Image - Takes up 1 column on desktop */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="relative w-160 h-52 rounded-lg overflow-hidden shadow-lg border border-black">
              <Image
                src="/images/regent/shadowcat.jpg"
                alt="Shadow the Cat"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Bottom spacer to match original */}
        <div className="h-16"></div>
      </main>

      {/* Credit link at bottom */}
      <div className="text-center pb-4">
        <a 
          href="https://www.cssdallas.com" 
          className="text-red-800 hover:text-red-600 underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          CSS Dallas
        </a>
      </div>
    </div>
  );
};

export default AboutUsPage;