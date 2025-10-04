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

const MiniatureGallery = () => {
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

  console.log('MiniatureGallery - userId:', userId, 'miniatures:', miniatures.length, 'showUpload:', showUpload);

  // Fetch miniatures
  useEffect(() => {
    const fetchMiniatures = async () => {
      try {
        console.log('Fetching miniatures...');
        const response = await fetch('/api/miniatures');
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Miniatures data:', data);
          setMiniatures(data);
        } else {
          console.error('Failed to fetch miniatures, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch miniatures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMiniatures();
  }, []);

  // Auto-advance slider
  useEffect(() => {
    if (miniatures.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % miniatures.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [miniatures.length]);

  // Don't render until auth is loaded to prevent render loops
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-xl border border-slate-600/30">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/miniatures', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Refresh miniatures list
        const refreshResponse = await fetch('/api/miniatures');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setMiniatures(data);
        }
        setShowUpload(false);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle image deletion
  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this miniature image?')) {
      return;
    }

    setDeleting(imageUrl);

    try {
      const response = await fetch(`/api/miniatures?url=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        const updatedMiniatures = miniatures.filter(m => m.url !== imageUrl);
        setMiniatures(updatedMiniatures);
        
        // Adjust current index if needed
        if (currentIndex >= updatedMiniatures.length && updatedMiniatures.length > 0) {
          setCurrentIndex(updatedMiniatures.length - 1);
        } else if (updatedMiniatures.length === 0) {
          setCurrentIndex(0);
        }
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % miniatures.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + miniatures.length) % miniatures.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800/50 rounded-xl border border-slate-600/30">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="text-slate-400">Loading miniatures...</span>
        </div>
      </div>
    );
  }

  if (miniatures.length === 0) {
    console.log('Rendering empty state, showUpload:', showUpload);
    return (
      <>
        <div className="bg-slate-800/50 rounded-xl border border-slate-600/30 p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-300 mb-2">No Miniatures Yet</h3>
          <p className="text-slate-400 mb-4">Share photos of your painted miniatures and tabletop setups!</p>
          
          {userId && (
            <button
              onClick={() => {
                console.log('Upload First Miniature button clicked!');
                console.log('Current showUpload state:', showUpload);
                setShowUpload(true);
                console.log('Set showUpload to true');
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              Upload First Miniature
            </button>
          )}
        </div>

        {/* Upload modal - available in empty state too */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => console.log('Modal backdrop clicked')}>
            <div className="bg-slate-800 rounded-xl border border-slate-600/30 p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-200">Upload Miniature</h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-slate-300 text-sm mb-2">
                  Share photos of your painted miniatures, battle setups, and tabletop scenes!
                </p>
                <p className="text-slate-400 text-xs">
                  Images will be automatically compressed and resized.
                </p>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                />
                
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                      <span className="text-slate-200 text-sm">Uploading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Debug modal rendering
  if (showUpload) {
    console.log('MODAL SHOULD BE RENDERING! showUpload:', showUpload);
  }

  return (
    <div className="relative">
      {/* Main slider */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-600/30 shadow-xl group">
        <Image
          src={miniatures[currentIndex].url}
          alt="Miniature showcase"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20"></div>
        
        {/* Navigation arrows */}
        {miniatures.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-600/50 text-slate-200 hover:text-white hover:bg-slate-800/90 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-600/50 text-slate-200 hover:text-white hover:bg-slate-800/90 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Image counter */}
        {miniatures.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-600/50 text-slate-200 text-sm">
            {currentIndex + 1} / {miniatures.length}
          </div>
        )}
        
        {/* Upload date */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-600/50 text-slate-200 text-sm">
          {new Date(miniatures[currentIndex].uploadedAt).toLocaleDateString()}
        </div>

        {/* Delete button - only for authenticated users */}
        {userId && (
          <button
            onClick={() => handleImageDelete(miniatures[currentIndex].url)}
            disabled={deleting === miniatures[currentIndex].url}
            className="absolute top-4 right-4 p-2 bg-red-600/80 backdrop-blur-sm rounded-full border border-red-500/50 text-white hover:bg-red-700/90 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Delete this image"
          >
            {deleting === miniatures[currentIndex].url ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 size={16} />
            )}
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-400 w-6' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      )}

      {/* Upload button for authenticated users */}
      {userId && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              console.log('Upload button clicked!');
              setShowUpload(true);
            }}
            className="group px-4 py-2 bg-slate-700/60 backdrop-blur-sm border border-slate-500/50 text-slate-200 rounded-lg hover:bg-slate-600/60 hover:border-blue-400/50 transition-all duration-300 font-medium text-sm"
          >
            <span className="flex items-center">
              <Upload size={16} className="mr-2 group-hover:translate-y-0.5 transition-transform duration-300" />
              Share Your Miniatures
            </span>
          </button>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => console.log('Modal backdrop clicked')}>
          <div className="bg-slate-800 rounded-xl border border-slate-600/30 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-200">Upload Miniature</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-slate-300 text-sm mb-2">
                Share photos of your painted miniatures, battle setups, and tabletop scenes!
              </p>
              <p className="text-slate-400 text-xs">
                Images will be automatically compressed and resized.
              </p>
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full p-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
              />
              
              {uploading && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <span className="text-slate-200 text-sm">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniatureGallery;