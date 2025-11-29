'use client';

import { useEffect, useRef, useState } from 'react';

type GameState = 'title' | 'playing' | 'levelComplete' | 'gameOver';

interface Position {
  x: number;
  y: number;
}

interface City extends Position {
  alive: boolean;
}

interface Silo extends Position {
  missiles: number;
  alive: boolean;
}

interface Missile {
  start: Position;
  target: Position & { alive?: boolean };
  pos: Position;
  alive: boolean;
  dx: number;
  dy: number;
}

interface Explosion extends Position {
  size: number;
  dir: number;
  alive: boolean;
}

export default function MissileCommand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('title');
  const gameStateRef = useRef<GameState>('title');
  const requestRef = useRef<number | undefined>(undefined);

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 550;
  const groundY = 500;
  const cityWidth = 45;
  const cityHeight = 25;
  const cityY = groundY - cityHeight;
  const siloY = groundY - 30;
  const missileSize = 4;
  const counterMissileSpeed = 15;

  // Game state refs
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const missileSpeedRef = useRef(1);
  const totalMissilesRef = useRef(20);
  const missilesPerSpawnRef = useRef(3);
  const spawnIntervalRef = useRef(3000);

  const missilesRef = useRef<Missile[]>([]);
  const counterMissilesRef = useRef<Missile[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const citiesRef = useRef<City[]>([]);
  const silosRef = useRef<Silo[]>([]);
  const missileCountRef = useRef(0);
  const lastTimeRef = useRef(-2000);

  const siloPos = [55, CANVAS_WIDTH / 2, 745];

  // Initialize game
  const initGame = (resetLevel = false) => {
    if (resetLevel) {
      levelRef.current = 1;
      scoreRef.current = 0;
      missileSpeedRef.current = 1;
      totalMissilesRef.current = 20;
      missilesPerSpawnRef.current = 3;
      spawnIntervalRef.current = 3000;
    }

    missilesRef.current = [];
    counterMissilesRef.current = [];
    explosionsRef.current = [];
    missileCountRef.current = 0;
    lastTimeRef.current = -2000;

    citiesRef.current = [
      { x: 140, y: cityY, alive: true },
      { x: 220, y: cityY, alive: true },
      { x: 300, y: cityY, alive: true },
      { x: 500, y: cityY, alive: true },
      { x: 580, y: cityY, alive: true },
      { x: 660, y: cityY, alive: true }
    ];

    silosRef.current = [
      { x: siloPos[0], y: siloY, missiles: 10, alive: true },
      { x: siloPos[1], y: siloY, missiles: 10, alive: true },
      { x: siloPos[2], y: siloY, missiles: 10, alive: true }
    ];
  };

  const nextLevel = () => {
    levelRef.current++;

    // Increase difficulty
    missileSpeedRef.current = Math.min(3, 1 + (levelRef.current - 1) * 0.3);
    totalMissilesRef.current = 20 + (levelRef.current - 1) * 5;
    missilesPerSpawnRef.current = Math.min(6, 3 + Math.floor((levelRef.current - 1) / 2));
    spawnIntervalRef.current = Math.max(1500, 3000 - (levelRef.current - 1) * 200);

    // Bonus points for surviving cities
    const survivingCities = citiesRef.current.filter(c => c.alive).length;
    scoreRef.current += survivingCities * 100;

    initGame(false);
  };

  // Utility functions
  const randInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const angleBetweenPoints = (source: Position, target: Position) => {
    return Math.atan2(target.y - source.y, target.x - source.x) + Math.PI / 2;
  };

  const distance = (source: Position, target: Position) => {
    return Math.hypot(source.x - target.x, source.y - target.y);
  };

  const spawnMissile = () => {
    const targets = citiesRef.current.concat(silosRef.current);
    const missileSpawns = citiesRef.current
      .concat(silosRef.current)
      .concat([{ x: 0, y: 0, alive: true }, { x: CANVAS_WIDTH, y: 0, alive: true }])
      .map(pos => ({ x: pos.x, y: 0 }));

    const randSpawn = randInt(0, missileSpawns.length - 1);
    const randTarget = randInt(0, targets.length - 1);
    const start = missileSpawns[randSpawn];
    const target = targets[randTarget];
    const angle = angleBetweenPoints(start, target);

    missilesRef.current.push({
      start,
      target,
      pos: { x: start.x, y: start.y },
      alive: true,
      dx: missileSpeedRef.current * Math.sin(angle),
      dy: missileSpeedRef.current * -Math.cos(angle)
    });
  };

  const drawTitleScreen = (ctx: CanvasRenderingContext2D, time: number) => {
    // Starfield background
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < 100; i++) {
      const x = (i * 123) % CANVAS_WIDTH;
      const y = (i * 456) % CANVAS_HEIGHT;
      const brightness = Math.sin(time / 1000 + i) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Title
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00ffff';
    ctx.fillText('MISSILE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    ctx.fillText('COMMAND', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Blinking "Press Space"
    if (Math.floor(time / 500) % 2 === 0) {
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#ffff00';
      ctx.fillText('PRESS SPACE TO START', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
    }

    // High score
    ctx.font = '20px monospace';
    ctx.fillStyle = '#ff00ff';
    ctx.fillText(`HIGH SCORE: ${scoreRef.current}`, CANVAS_WIDTH / 2, 50);
  };

  const drawLevelComplete = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.fillText(`LEVEL ${levelRef.current} COMPLETE!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.font = '24px monospace';
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 0;
    const survivingCities = citiesRef.current.filter(c => c.alive).length;
    ctx.fillText(`CITIES SAVED: ${survivingCities} x 100 = ${survivingCities * 100}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText(`SCORE: ${scoreRef.current}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
  };

  const drawGameOver = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.shadowBlur = 0;
    ctx.font = '28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`FINAL SCORE: ${scoreRef.current}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText(`LEVEL REACHED: ${levelRef.current}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

    if (Math.floor(time / 500) % 2 === 0) {
      ctx.font = '24px monospace';
      ctx.fillStyle = '#ffff00';
      ctx.fillText('PRESS SPACE TO RESTART', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
    }
  };

  const drawGame = (ctx: CanvasRenderingContext2D, time: number) => {
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    for (let i = 0; i < 50; i++) {
      const x = (i * 157) % CANVAS_WIDTH;
      const y = (i * 271) % (groundY - 50);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 1, 1);
    }

    // HUD
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#00ffff';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${scoreRef.current}`, 10, 30);
    ctx.fillText(`LEVEL: ${levelRef.current}`, 10, 55);

    const survivingCities = citiesRef.current.filter(c => c.alive).length;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`CITIES: ${survivingCities}`, CANVAS_WIDTH - 10, 30);

    // Draw cities
    citiesRef.current.forEach(city => {
      if (city.alive) {
        // Building gradient
        const cityGradient = ctx.createLinearGradient(city.x - cityWidth / 2, city.y, city.x - cityWidth / 2, city.y + cityHeight);
        cityGradient.addColorStop(0, '#0088ff');
        cityGradient.addColorStop(1, '#0044aa');
        ctx.fillStyle = cityGradient;
        ctx.fillRect(city.x - cityWidth / 2, city.y, cityWidth, cityHeight);

        // Windows
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 2; j++) {
            if (Math.random() > 0.3) {
              ctx.fillRect(city.x - cityWidth / 2 + 8 + i * 12, city.y + 5 + j * 10, 4, 6);
            }
          }
        }
      }
    });

    // Draw ground and silos
    ctx.fillStyle = '#886644';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    ctx.lineTo(0, groundY);

    siloPos.forEach(x => {
      ctx.lineTo(x - 40, groundY);
      ctx.lineTo(x - 20, siloY);
      ctx.lineTo(x + 20, siloY);
      ctx.lineTo(x + 40, groundY);
    });

    ctx.lineTo(CANVAS_WIDTH, groundY);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();

    // Draw silo missiles
    silosRef.current.forEach(silo => {
      if (silo.alive) {
        ctx.fillStyle = '#00ff00';
        let missilesPerRow = 1;
        let count = 0;
        let x = silo.x;
        let y = silo.y + 5;

        for (let i = 0; i < silo.missiles; i++) {
          ctx.fillRect(x, y, 4, 10);
          x += 12;

          if (++count === missilesPerRow) {
            x = silo.x - 6 * count;
            missilesPerRow++;
            y += 7;
            count = 0;
          }
        }
      }
    });

    // Draw enemy missiles
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.fillStyle = Math.round(time / 2) % 2 === 0 ? '#ffffff' : '#ff0000';

    missilesRef.current.forEach(missile => {
      if (missile.alive) {
        ctx.beginPath();
        ctx.moveTo(missile.start.x, missile.start.y);
        ctx.lineTo(missile.pos.x, missile.pos.y);
        ctx.stroke();
        ctx.fillRect(missile.pos.x - missileSize / 2, missile.pos.y - missileSize / 2, missileSize, missileSize);
      }
    });

    // Draw counter missiles
    ctx.strokeStyle = '#00ffff';
    ctx.fillStyle = '#ffffff';
    counterMissilesRef.current.forEach(missile => {
      if (missile.alive) {
        ctx.beginPath();
        ctx.moveTo(missile.start.x, missile.start.y);
        ctx.lineTo(missile.pos.x, missile.pos.y);
        ctx.stroke();
        ctx.fillRect(missile.pos.x - 2, missile.pos.y - 2, 4, 4);
      }
    });

    // Draw explosions
    explosionsRef.current.forEach(explosion => {
      if (explosion.alive) {
        const gradient = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, explosion.size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#ffff00');
        gradient.addColorStop(0.6, '#ff8800');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const updateGame = (time: number) => {
    // Spawn missiles
    if (time - lastTimeRef.current > spawnIntervalRef.current && missileCountRef.current < totalMissilesRef.current) {
      for (let i = 0; i < missilesPerSpawnRef.current; i++) {
        if (missileCountRef.current < totalMissilesRef.current) {
          spawnMissile();
          missileCountRef.current++;
        }
      }
      lastTimeRef.current = time;
    }

    // Update missiles
    missilesRef.current.forEach(missile => {
      missile.pos.x += missile.dx;
      missile.pos.y += missile.dy;

      // Check collision with explosions
      explosionsRef.current.forEach(explosion => {
        const dist = distance(explosion, missile.pos);
        if (dist < missileSize + explosion.size) {
          missile.alive = false;
          scoreRef.current += 25;
        }
      });

      // Check if reached target
      const dist = distance(missile.pos, missile.target);
      if (dist < missileSpeedRef.current) {
        missile.alive = false;
        missile.target.alive = false;
      }

      // Create explosion when missile dies
      if (!missile.alive && missile.pos.y > 0) {
        const alreadyExploded = explosionsRef.current.some(e =>
          distance(e, missile.pos) < 5
        );
        if (!alreadyExploded) {
          explosionsRef.current.push({
            x: missile.pos.x,
            y: missile.pos.y,
            size: 2,
            dir: 1,
            alive: true
          });
        }
      }
    });

    // Update counter missiles
    counterMissilesRef.current.forEach(missile => {
      missile.pos.x += missile.dx;
      missile.pos.y += missile.dy;

      const dist = distance(missile.pos, missile.target);
      if (dist < counterMissileSpeed) {
        missile.alive = false;
        explosionsRef.current.push({
          x: missile.pos.x,
          y: missile.pos.y,
          size: 2,
          dir: 1,
          alive: true
        });
      }
    });

    // Update explosions
    explosionsRef.current.forEach(explosion => {
      explosion.size += 0.35 * explosion.dir;
      if (explosion.size > 30) {
        explosion.dir = -1;
      }
      if (explosion.size <= 0) {
        explosion.alive = false;
      }
    });

    // Clean up dead objects
    missilesRef.current = missilesRef.current.filter(m => m.alive);
    counterMissilesRef.current = counterMissilesRef.current.filter(m => m.alive);
    explosionsRef.current = explosionsRef.current.filter(e => e.alive);
    citiesRef.current = citiesRef.current.filter(c => c.alive);
    silosRef.current = silosRef.current.filter(s => s.alive);

    // Check game over condition
    if (citiesRef.current.length === 0) {
      gameStateRef.current = 'gameOver';
      setGameState('gameOver');
    }

    // Check level complete
    if (missileCountRef.current >= totalMissilesRef.current &&
        missilesRef.current.length === 0 &&
        citiesRef.current.length > 0) {
      gameStateRef.current = 'levelComplete';
      setGameState('levelComplete');
      setTimeout(() => {
        if (gameStateRef.current === 'levelComplete') {
          nextLevel();
          gameStateRef.current = 'playing';
          setGameState('playing');
        }
      }, 3000);
    }
  };

  const gameLoop = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameStateRef.current === 'title') {
      drawTitleScreen(ctx, time);
    } else if (gameStateRef.current === 'playing') {
      updateGame(time);
      drawGame(ctx, time);
    } else if (gameStateRef.current === 'levelComplete') {
      drawGame(ctx, time);
      drawLevelComplete(ctx);
    } else if (gameStateRef.current === 'gameOver') {
      drawGameOver(ctx, time);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let selectedSilo: Silo | undefined;
    let siloDistance = Infinity;

    silosRef.current.forEach(silo => {
      if (silo.alive && silo.missiles > 0) {
        const dist = distance({ x, y }, silo);
        if (dist < siloDistance) {
          siloDistance = dist;
          selectedSilo = silo;
        }
      }
    });

    if (!selectedSilo) return;
    
    const start = { x: selectedSilo.x, y: selectedSilo.y };
    const target = { x, y };
    const angle = angleBetweenPoints(start, target);
    selectedSilo.missiles--;

    counterMissilesRef.current.push({
      start,
      target,
      pos: { x: selectedSilo.x, y: selectedSilo.y },
      dx: counterMissileSpeed * Math.sin(angle),
      dy: counterMissileSpeed * -Math.cos(angle),
      alive: true
    });
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (gameStateRef.current === 'title') {
        initGame(true);
        gameStateRef.current = 'playing';
        setGameState('playing');
      } else if (gameStateRef.current === 'gameOver') {
        initGame(true);
        gameStateRef.current = 'title';
        setGameState('title');
      }
    }
  };

  useEffect(() => {
    initGame(true);

    window.addEventListener('keydown', handleKeyPress);
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#000',
      margin: 0,
      padding: '20px'
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleClick}
        style={{
          border: '2px solid #00ffff',
          cursor: 'crosshair',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}
