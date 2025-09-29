"use client"

import React, { useState, useRef, useEffect } from 'react';
// Image import removed (not used)

const DiceRollerPage = () => {
  type Roll = {
    id: number;
    name?: string;
    diceCount: number;
    diceType: number;
    modifier: number;
    rolls: number[];
    total: number;
    finalTotal: number;
    timestamp: string;
    isCritical?: boolean;
    isCriticalFail?: boolean;
  };

  const [rollHistory, setRollHistory] = useState<Roll[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentRoll, setCurrentRoll] = useState<Roll | null>(null);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [diceType, setDiceType] = useState<number>(20);
  const [modifier, setModifier] = useState<number>(0);
  const [rollName, setRollName] = useState<string>('');
  const [animationKey, setAnimationKey] = useState<number>(0);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const [dots, setDots] = useState<Array<{ left: string; top: string; animationDelay: string; animationDuration: string }>>([]);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];
  const commonRolls = [
    { name: 'Quick d4', dice: '1d4', mod: 0 },
    { name: 'Quick d6', dice: '1d6', mod: 0 },
    { name: 'Quick d8', dice: '1d8', mod: 0 },
    { name: 'Quick d10', dice: '1d10', mod: 0 },
    { name: 'Quick d12', dice: '1d12', mod: 0 },
    { name: 'Quick d20', dice: '1d20', mod: 0 },
    { name: 'Quick Percentage', dice: '1d100', mod: 0 },
    { name: 'Healing (Potion)', dice: '1d8', mod: 3 },
  ];

  const rollDice = (customDice: string | null = null, customMod: number | null = null, customName: string | null = null) => {
    setIsRolling(true);
    setAnimationKey(prev => prev + 1);

    const actualDiceCount = customDice ? parseInt(customDice.split('d')[0]) : diceCount;
    const actualDiceType = customDice ? parseInt(customDice.split('d')[1]) : diceType;
    const actualModifier = customMod !== null ? customMod : modifier;
    const actualName = customName || rollName;

    setTimeout(() => {
      const rolls = [];
      let total = 0;

      for (let i = 0; i < actualDiceCount; i++) {
        const roll = Math.floor(Math.random() * actualDiceType) + 1;
        rolls.push(roll);
        total += roll;
      }

      const finalTotal = total + actualModifier;
      const rollResult = {
        id: Date.now(),
        name: actualName,
        diceCount: actualDiceCount,
        diceType: actualDiceType,
        modifier: actualModifier,
        rolls: rolls,
        total: total,
        finalTotal: finalTotal,
        timestamp: new Date().toLocaleTimeString(),
        isCritical: actualDiceType === 20 && rolls.includes(20),
        isCriticalFail: actualDiceType === 20 && rolls.includes(1)
      };

      setCurrentRoll(rollResult);
      setRollHistory(prev => [rollResult, ...prev.slice(0, 19)]); // Keep last 20 rolls
      setIsRolling(false);
    }, 1000);
  };

  const quickRoll = (rollData: { name: string; dice: string; mod: number }) => {
    // split but we don't need the individual values here; rollDice will parse
    rollDice(rollData.dice, rollData.mod, rollData.name);
  };

  const getDiceIcon = (type: number) => {
    const icons: Record<number, string> = {
      4: '▲',
      6: '⬢',
      8: '♦',
      10: '◊',
      12: '◉',
      20: '⚀',
      100: '%'
    };
    return icons[type] ?? '⚀';
  };

  const formatRollNotation = (): string => {
    let notation = `${diceCount}d${diceType}`;
    if (modifier > 0) notation += `+${modifier}`;
    if (modifier < 0) notation += `${modifier}`;
    return notation;
  };

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [rollHistory]);

  // Generate animated background dots only on the client to avoid SSR/CSR mismatch
  useEffect(() => {
    const items = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
    }));
    setDots(items);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-20">
          {dots.map((d, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: d.left,
                top: d.top,
                animationDelay: d.animationDelay,
                animationDuration: d.animationDuration,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes rollBounce {
          0% { transform: scale(1) rotateY(0deg); }
          25% { transform: scale(1.2) rotateY(90deg); }
          50% { transform: scale(1.3) rotateY(180deg); }
          75% { transform: scale(1.2) rotateY(270deg); }
          100% { transform: scale(1) rotateY(360deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }

        @keyframes criticalGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 60px rgba(34, 197, 94, 0.8); }
        }

        @keyframes failGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 60px rgba(239, 68, 68, 0.8); }
        }
        
        .rolling-animation {
          animation: rollBounce 1s ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div className="relative z-20 pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-alkatra text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-4">
              Dice of Destiny
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Roll the bones of fate for your Pathfinder adventure
            </p>
            <p className="text-slate-400 italic">
              &quot;Fortune favors the bold... and the well-rolled.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Dice Roller Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6 shadow-2xl">
              
              {/* Current Roll Display */}
              <div className="text-center mb-8">
                <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600/50">
                  {currentRoll ? (
                    <div className={`${currentRoll.isCritical ? 'text-green-400' : currentRoll.isCriticalFail ? 'text-red-400' : 'text-blue-200'}`}>
                      <div className="text-sm text-slate-400 mb-2">
                        {currentRoll.name && <span>{currentRoll.name} • </span>}
                        {currentRoll.timestamp}
                      </div>
                      <div className="text-lg text-slate-300 mb-2">
                        {currentRoll.diceCount}d{currentRoll.diceType}
                        {currentRoll.modifier !== 0 && (currentRoll.modifier > 0 ? `+${currentRoll.modifier}` : currentRoll.modifier)}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">
                        Rolls: [{currentRoll.rolls.join(', ')}]
                        {currentRoll.modifier !== 0 && ` ${currentRoll.modifier > 0 ? '+' : ''}${currentRoll.modifier}`}
                      </div>
                      <div className={`text-4xl font-bold ${currentRoll.isCritical ? 'animate-pulse' : ''}`}>
                        {currentRoll.finalTotal}
                      </div>
                      {currentRoll.isCritical && (
                        <div className="text-green-400 font-bold mt-2 animate-pulse">
                          ⚡ CRITICAL! ⚡
                        </div>
                      )}
                      {currentRoll.isCriticalFail && (
                        <div className="text-red-400 font-bold mt-2 animate-pulse">
                          💀 CRITICAL FAIL! 💀
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-400">
                      <div className="text-6xl mb-4" key={animationKey}>
                        {isRolling ? (
                          <span className="rolling-animation inline-block">🎲</span>
                        ) : (
                          '🎲'
                        )}
                      </div>
                      <div className="text-lg">
                        {isRolling ? 'Rolling...' : 'Ready to roll the dice of fate'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Roll Controls */}
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Roll Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={rollName}
                    onChange={(e) => setRollName(e.target.value)}
                    placeholder="e.g., Attack Roll, Fireball Damage"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-2">
                    Current Roll: {formatRollNotation()}
                  </label>
                  <div className="text-slate-400 text-sm">
                    Configure your dice below
                  </div>
                </div>
              </div>

              {/* Dice Configuration */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="sm:w-48 mx-auto">
                  <label className="block text-slate-300 font-medium mb-2">
                    Number of Dice
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                      className="px-2 py-2 bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/50 rounded-lg text-white transition-colors"
                      disabled={isRolling}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={diceCount}
                      onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-2 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-center focus:border-blue-400 focus:outline-none"
                      disabled={isRolling}
                    />
                    <button
                      onClick={() => setDiceCount(Math.min(20, diceCount + 1))}
                      className="px-2 py-2 bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/50 rounded-lg text-white transition-colors"
                      disabled={isRolling}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="sm:w-48 mx-auto">
                  <label className="block text-slate-300 font-medium mb-2">
                    Dice Type
                  </label>
                  <select
                    value={diceType}
                    onChange={(e) => setDiceType(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                    disabled={isRolling}
                  >
                    {diceTypes.map(type => (
                      <option key={type} value={type}>
                        d{type} {getDiceIcon(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:w-48 mx-auto">
                  <label className="block text-slate-300 font-medium mb-2">
                    Modifier
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setModifier(modifier - 1)}
                      className="px-3 py-2 bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/50 rounded-lg text-white transition-colors"
                      disabled={isRolling}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={modifier}
                      onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                      className="w-30 flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-center focus:border-blue-400 focus:outline-none"
                      disabled={isRolling}
                    />
                    <button
                      onClick={() => setModifier(modifier + 1)}
                      className="px-3 py-2 bg-slate-600/50 hover:bg-slate-500/50 border border-slate-500/50 rounded-lg text-white transition-colors"
                      disabled={isRolling}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Roll Button */}
              <div className="text-center mb-8">
                <button
                  onClick={() => rollDice()}
                  disabled={isRolling}
                  className={`group px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isRolling ? 'animate-pulse' : ''}`}
                >
                  <span className="flex items-center">
                    🎲 {isRolling ? 'Rolling...' : `Roll ${formatRollNotation()}`}
                  </span>
                </button>
              </div>

              {/* Quick Roll Buttons */}
              <div>
                <h3 className="text-lg font-bold text-blue-200 mb-4">Quick Rolls</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {commonRolls.map((roll, index) => (
                    <button
                      key={index}
                      onClick={() => quickRoll(roll)}
                      disabled={isRolling}
                      className="px-3 py-2 bg-slate-700/60 hover:bg-slate-600/60 border border-slate-500/50 text-slate-200 rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400/50"
                    >
                      <div className="font-medium">{roll.name}</div>
                      <div className="text-xs text-slate-400">
                        {roll.dice}{roll.mod !== 0 && (roll.mod > 0 ? `+${roll.mod}` : roll.mod)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Roll History Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6 shadow-2xl h-fit max-h-[800px]">
              <h3 className="text-xl font-bold text-blue-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Roll History
              </h3>
              
              <div ref={historyRef} className="space-y-3 max-h-[700px] overflow-y-auto custom-scrollbar">
                {rollHistory.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">
                    <div className="text-4xl mb-2">📜</div>
                    <div>No rolls yet</div>
                    <div className="text-sm">Your dice history will appear here</div>
                  </div>
                ) : (
                  rollHistory.map((roll) => (
                    <div
                      key={roll.id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        roll.isCritical 
                          ? 'bg-green-900/30 border-green-400/50' 
                          : roll.isCriticalFail 
                            ? 'bg-red-900/30 border-red-400/50' 
                            : 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-sm text-slate-400">{roll.timestamp}</div>
                        <div className={`text-lg font-bold ${
                          roll.isCritical ? 'text-green-400' : roll.isCriticalFail ? 'text-red-400' : 'text-blue-200'
                        }`}>
                          {roll.finalTotal}
                        </div>
                      </div>
                      
                      {roll.name && (
                        <div className="text-slate-300 font-medium text-sm mb-1">{roll.name}</div>
                      )}
                      
                      <div className="text-xs text-slate-400">
                        {roll.diceCount}d{roll.diceType}
                        {roll.modifier !== 0 && (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier)}
                      </div>
                      
                      <div className="text-xs text-slate-500 mt-1">
                        [{roll.rolls.join(', ')}]
                        {roll.modifier !== 0 && ` ${roll.modifier > 0 ? '+' : ''}${roll.modifier}`}
                      </div>
                      
                      {roll.isCritical && (
                        <div className="text-green-400 text-xs font-bold mt-1">⚡ CRITICAL!</div>
                      )}
                      {roll.isCriticalFail && (
                        <div className="text-red-400 text-xs font-bold mt-1">💀 FUMBLE!</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {rollHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-600/30">
                  <button
                    onClick={() => setRollHistory([])}
                    className="w-full px-4 py-2 bg-slate-700/60 hover:bg-slate-600/60 border border-slate-500/50 text-slate-300 rounded-lg transition-all duration-300 text-sm"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.7);
        }
      `}</style>
    </div>
  );
};

export default DiceRollerPage;