'use client';

import { useState } from 'react';
import MissileCommand from '@/components/MissileCommand';
import AlienInvasion from '@/components/AlienInvasion';

export default function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<'missile-command' | 'alien-invasion' | null>(null);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-500">
        🕹️ ARCADE 🕹️
      </h1>

      {/* Game Display Area */}
      {selectedGame === 'missile-command' && (
        <div className="mb-8 flex justify-center">
          <MissileCommand />
        </div>
      )}
      {selectedGame === 'alien-invasion' && (
        <div className="mb-8 flex justify-center">
          <AlienInvasion />
        </div>
      )}

      {/* Game Selection Links */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Select a Game:</h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSelectedGame('missile-command')}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedGame === 'missile-command'
                ? 'border-green-500 bg-green-900/30'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">🚀 Missile Command</h3>
            <p className="text-gray-400">
              Defend your cities from incoming missiles. Use arrow keys to aim and X to fire.
            </p>
          </button>

          <button
            onClick={() => setSelectedGame('alien-invasion')}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedGame === 'alien-invasion'
                ? 'border-green-500 bg-green-900/30'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500'
            }`}
          >
            <h3 className="text-xl font-bold mb-2">👾 Alien Invasion</h3>
            <p className="text-gray-400">
              Classic Space Invaders action. Use arrow keys to move and space to shoot.
            </p>
          </button>
        </div>

        {selectedGame && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setSelectedGame(null)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Close Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
