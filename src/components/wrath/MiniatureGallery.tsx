'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Upload, X, Trash2 } from 'lucide-react';

interface MiniatureBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

const WrathMiniatureGallery = () => {
  const { data: session, status } = useSession()
  // @ts-expect-error - Custom NextAuth user.id property
  const userId = session?.user?.id || null
  const isLoaded = status !== 'loading'
  const [miniatures, setMiniatures] = useState<MiniatureBlob[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchMiniatures = async () => {
      try {
        const response = await fetch('/api/miniatures?campaign=wrath');
        if (response.ok) {
          setMiniatures(await response.json());
        }
      } catch (error) {
        console.error('Failed to fetch miniatures:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMiniatures();
  }, []);

  useEffect(() => {
    if (miniatures.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % miniatures.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [miniatures.length]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-black border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wotr-gold"></div>
          <span className="text-zinc-400 font-spectral">Loading...</span>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/miniatures?campaign=wrath', { method: 'POST', body: formData });
      if (response.ok) {
        const refreshResponse = await fetch('/api/miniatures?campaign=wrath');
        if (refreshResponse.ok) setMiniatures(await refreshResponse.json());
        setShowUpload(false);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('Remove this image from the war record?')) return;
    setDeleting(imageUrl);
    try {
      const response = await fetch(`/api/miniatures?url=${encodeURIComponent(imageUrl)}`, { method: 'DELETE' });
      if (response.ok) {
        const updated = miniatures.filter(m => m.url !== imageUrl);
        setMiniatures(updated);
        if (currentIndex >= updated.length && updated.length > 0) setCurrentIndex(updated.length - 1);
        else if (updated.length === 0) setCurrentIndex(0);
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error}`);
      }
    } catch {
      alert('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % miniatures.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + miniatures.length) % miniatures.length);

  const uploadModal = showUpload && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-950 border border-wotr-gold/40 p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-lg text-wotr-gold tracking-widest uppercase">Submit War Record</h3>
          <button onClick={() => setShowUpload(false)} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-zinc-300 font-spectral text-sm mb-1">Share photos of your crusade — painted miniatures, battle setups, and tactical displays.</p>
          <p className="text-zinc-500 font-spectral text-xs">Images will be automatically compressed and resized.</p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="w-full p-3 bg-black border border-zinc-700 text-zinc-200 font-spectral file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-cinzel file:bg-wotr-gold file:text-stone-dark hover:file:bg-wotr-gold/90 disabled:opacity-50"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-wotr-gold"></div>
                <span className="text-zinc-200 font-spectral text-sm">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-black border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wotr-gold"></div>
          <span className="text-zinc-400 font-spectral">Loading war record...</span>
        </div>
      </div>
    );
  }

  if (miniatures.length === 0) {
    return (
      <>
        <div className="bg-black border border-zinc-800 p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="font-cinzel text-lg text-zinc-400 uppercase tracking-widest mb-2">No Images Filed</h3>
          <p className="text-zinc-500 font-spectral mb-4">Document the crusade — submit photos of your painted miniatures and battle scenes.</p>
          {userId && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2 border border-wotr-gold/50 text-wotr-gold font-cinzel text-sm uppercase tracking-widest hover:bg-wotr-gold/10 transition-colors"
            >
              Submit First Image
            </button>
          )}
        </div>
        {uploadModal}
      </>
    );
  }

  return (
    <div className="relative">
      {/* Main slider */}
      <div className="relative aspect-[4/3] border border-zinc-800 overflow-hidden group shadow-2xl">
        <Image
          src={miniatures[currentIndex].url}
          alt="Crusade miniature"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {miniatures.length > 1 && (
          <>
            <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 border border-zinc-700 text-zinc-300 hover:text-wotr-gold hover:border-wotr-gold/50 transition-all duration-300 opacity-0 group-hover:opacity-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 border border-zinc-700 text-zinc-300 hover:text-wotr-gold hover:border-wotr-gold/50 transition-all duration-300 opacity-0 group-hover:opacity-100">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {miniatures.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 border border-zinc-700 text-zinc-300 font-cinzel text-xs tracking-widest">
            {currentIndex + 1} / {miniatures.length}
          </div>
        )}

        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 border border-zinc-700 text-zinc-400 font-spectral text-xs">
          {new Date(miniatures[currentIndex].uploadedAt).toLocaleDateString()}
        </div>

        {userId && (
          <button
            onClick={() => handleImageDelete(miniatures[currentIndex].url)}
            disabled={deleting === miniatures[currentIndex].url}
            className="absolute top-3 right-3 p-2 bg-red-900/80 border border-red-700/50 text-white hover:bg-red-800 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Delete this image"
          >
            {deleting === miniatures[currentIndex].url
              ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              : <Trash2 size={16} />
            }
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {miniatures.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {miniatures.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-none transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-wotr-gold' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      )}

      {userId && (
        <div className="mt-5 text-center">
          <button
            onClick={() => setShowUpload(true)}
            className="group inline-flex items-center gap-2 px-5 py-2 border border-zinc-700 hover:border-wotr-gold/50 text-zinc-400 hover:text-wotr-gold font-cinzel text-xs uppercase tracking-widest transition-all duration-300"
          >
            <Upload size={14} className="group-hover:translate-y-0.5 transition-transform duration-300" />
            Submit Battle Record
          </button>
        </div>
      )}

      {uploadModal}
    </div>
  );
};

export default WrathMiniatureGallery;
