'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';

export default function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setMotionAllowed(!preference.matches);
      setReady(false);
      setPlaying(false);
    };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  const showVideo = motionAllowed && !failed;

  return (
    <>
      <Image
        src="/images/wrath/video-seed.png"
        alt="A crusader and glowing wardstone overlook a devastated city"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      {showVideo && (
        <video
          ref={videoRef}
          src="/videos/wrath/hero-loop.mp4"
          poster="/images/wrath/video-seed.png"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover ${ready ? 'opacity-100' : 'opacity-0'}`}
          onPlaying={() => {
            setReady(true);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}
      {showVideo && (
        <button
          type="button"
          className="absolute bottom-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded border border-white/20 bg-black/60 text-white/80 hover:bg-black/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label={playing ? 'Pause background video' : 'Play background video'}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              // A playback-policy rejection is not a broken video; allow another try.
              void video.play().catch(() => setPlaying(false));
            } else {
              video.pause();
            }
          }}
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
          )}
        </button>
      )}
    </>
  );
}
