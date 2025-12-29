'use client'

export default function RiftTransition() {
  return (
    <div className="relative w-full h-64 bg-black overflow-hidden">
      {/* 1. The "Tear" Background - A jagged, moving energy field */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-transparent to-red-950 animate-pulse"></div>
      </div>

      {/* 2. Animated Energy Veins (The "Rift" Lines) */}
      <div className="absolute inset-0 flex justify-around opacity-60">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-px h-full bg-gradient-to-b from-purple-500 via-transparent to-red-600 blur-[2px]"
            style={{
              transform: `translateX(${Math.sin(i) * 20}px) rotate(${i % 2 === 0 ? '2deg' : '-2deg'})`,
              animation: `drift ${3 + i}s infinite alternate ease-in-out`
            }}
          ></div>
        ))}
      </div>

      {/* 3. The "Void Motes" - Floating particles that change color */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40 blur-[1px]"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              boxShadow: i % 2 === 0 ? '0 0 10px #a855f7' : '0 0 10px #ef4444',
              animation: `float ${5 + Math.random() * 5}s infinite linear`
            }}
          ></div>
        ))}
      </div>

      {/* 4. Top/Bottom Jagged Masks (Hides the straight lines) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg className="relative block w-full h-[40px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.47V0Z" fill="#000000"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#000000"></path>
        </svg>
      </div>

      {/* 5. Center Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative group">
          <div className="absolute -inset-4 bg-purple-600/20 blur-xl group-hover:bg-red-600/30 transition-all duration-1000"></div>
          <span className="relative font-cinzel text-sm tracking-[0.5em] text-purple-400 uppercase">
            Reality is <span className="text-red-600 animate-pulse">Bleeding</span>
          </span>
        </div>
      </div>

      {/* Tailwind Keyframes */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
        }
        @keyframes drift {
          from { transform: translateX(-10px) skewX(2deg); }
          to { transform: translateX(10px) skewX(-2deg); }
        }
      `}</style>
    </div>
  );
}
