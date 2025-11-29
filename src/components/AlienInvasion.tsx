'use client';

import { useEffect, useRef } from 'react';

// Types
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ClipRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
  direction: number;
  speed: number;
  alive: boolean;
}

interface Particle {
  x: number;
  y: number;
  xunits: number;
  yunits: number;
  life: number;
  maxLife: number;
  color: string;
  width: number;
  height: number;
  gravity: number;
  moves: number;
}

export default function AlienInvasion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStartedRef = useRef(false);
  const requestRef = useRef<number | undefined>(undefined);

  // Constants
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 640;
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const SHOOT_KEY = 88; // X key
  const ENTER_KEY = 13;

  // Sprite data (base64 embedded sprite sheet from original)
  const SPRITE_SHEET_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAEACAYAAAADRnAGAAACGUlEQVR42u3aSQ7CMBAEQIsn8P+/hiviAAK8zFIt5QbELiTHmfEYE3L9mZE9AAAAqAVwBQ8AAAD6THY5CgAAAKbfbPX3AQAAYBEEAADAuZrC6UUyfMEEAIBiAN8OePXnAQAAsLcmmKFPAQAAgHMbm+gbr3Sdo/LtcAAAANR6GywPAgBAM4D2JXAAABoBzBjA7AmlOx8AAEAzAOcDAADovTc4vQim6wUCABAYQG8QAADd4dPd2fRVYQAAANQG0B4HAABAawDnAwAA6AXgfAAAALpA2uMAAABwPgAAgPoAM9Ci/R4AAAD2dmqcEQIAIC/AiQGuAAYAAECcRS/a/cJXkUf2AAAAoBaA3iAAALrD+gIAAADY9baX/nwAAADNADwFAADo9YK0e5FMX/UFACA5QPSNEAAAAHKtCekmDAAAAADvBljtfgAAAGgMMGOrunvCy2uCAAAACFU6BwAAwF6AGQPa/XsAAADYB+B8AAAAtU+ItD4OAwAAAFVhAACaA0T7B44/BQAAANALwGMQAAAAADYO8If2+P31AgAAQN0SWbhFDwCAZlXgaO1xAAAA1FngnA8AACAeQPSNEAAAAM4CnC64AAAA4GzN4N9NSfgKEAAAAACszO26X8/X6BYAAAD0Anid8KcLAAAAAAAAAJBnwNEvAAAA9Jns1ygAAAAAAAAAAAAAAAAAAABAQ4COCENERERERERERBrnAa1sJuUVr3rsAAAAAElFTkSuQmCC";

  const PLAYER_CLIP_RECT = { x: 0, y: 204, w: 62, h: 32 };
  const ALIEN_BOTTOM_ROW = [
    { x: 0, y: 0, w: 51, h: 34 },
    { x: 0, y: 102, w: 51, h: 34 },
  ];
  const ALIEN_MIDDLE_ROW = [
    { x: 0, y: 137, w: 50, h: 33 },
    { x: 0, y: 170, w: 50, h: 34 },
  ];
  const ALIEN_TOP_ROW = [
    { x: 0, y: 68, w: 50, h: 32 },
    { x: 0, y: 34, w: 50, h: 32 },
  ];
  const ALIEN_X_MARGIN = 40;
  const ALIEN_SQUAD_WIDTH = 11 * ALIEN_X_MARGIN;

  // Game state refs
  const spriteSheetImgRef = useRef<HTMLImageElement | null>(null);
  const bulletImgRef = useRef<HTMLImageElement | null>(null);
  const keyStatesRef = useRef<boolean[]>([]);
  const prevKeyStatesRef = useRef<boolean[]>([]);
  const lastTimeRef = useRef(0);

  // Player state
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 70,
    w: PLAYER_CLIP_RECT.w * 0.85,
    h: PLAYER_CLIP_RECT.h * 0.85,
    xVel: 0,
    lives: 3,
    score: 0,
    bullets: [] as Bullet[],
    bulletDelayAccumulator: 0,
  });

  // Aliens state
  const aliensRef = useRef<Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    clipRects: ClipRect[];
    currentFrame: number;
    alive: boolean;
    stepDelay: number;
    stepAccumulator: number;
    bullet: Bullet | null;
  }>>([]);

  const alienDirectionRef = useRef(-1);
  const alienYDownRef = useRef(0);
  const updateAlienLogicRef = useRef(false);
  const alienCountRef = useRef(0);
  const waveRef = useRef(1);

  // Particles
  const particlesRef = useRef<Particle[]>([]);

  // Utility functions
  const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
  };

  const checkRectCollision = (A: Rect, B: Rect) => {
    const xOverlap = (A.x <= B.x + B.w && A.x >= B.x) || (B.x <= A.x + A.w && B.x >= A.x);
    const yOverlap = (A.y <= B.y + B.h && A.y >= B.y) || (B.y <= A.y + A.h && B.y >= A.y);
    return xOverlap && yOverlap;
  };

  const isKeyDown = (key: number) => keyStatesRef.current[key];
  const wasKeyPressed = (key: number) => !prevKeyStatesRef.current[key] && keyStatesRef.current[key];

  // Create bullet image
  const createBulletImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 2, 8);
    }
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  };

  // Setup alien formation
  const setupAlienFormation = () => {
    const aliens: typeof aliensRef.current = [];
    alienCountRef.current = 0;

    for (let i = 0; i < 5 * 11; i++) {
      const gridX = i % 11;
      const gridY = Math.floor(i / 11);
      let clipRects: ClipRect[];

      switch (gridY) {
        case 0:
        case 1:
          clipRects = ALIEN_BOTTOM_ROW;
          break;
        case 2:
        case 3:
          clipRects = ALIEN_MIDDLE_ROW;
          break;
        case 4:
        default:
          clipRects = ALIEN_TOP_ROW;
          break;
      }

      const scale = 0.5;
      aliens.push({
        x: CANVAS_WIDTH / 2 - ALIEN_SQUAD_WIDTH / 2 + ALIEN_X_MARGIN / 2 + gridX * ALIEN_X_MARGIN,
        y: CANVAS_HEIGHT / 3.25 - gridY * 40,
        w: clipRects[0].w * scale,
        h: clipRects[0].h * scale,
        clipRects,
        currentFrame: 0,
        alive: true,
        stepDelay: 1,
        stepAccumulator: 0,
        bullet: null,
      });
      alienCountRef.current++;
    }

    aliensRef.current = aliens;
  };

  // Initialize game
  const initGame = () => {
    playerRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 70,
      w: PLAYER_CLIP_RECT.w * 0.85,
      h: PLAYER_CLIP_RECT.h * 0.85,
      xVel: 0,
      lives: 3,
      score: 0,
      bullets: [],
      bulletDelayAccumulator: 0,
    };

    alienDirectionRef.current = -1;
    alienYDownRef.current = 0;
    updateAlienLogicRef.current = false;
    waveRef.current = 1;
    particlesRef.current = [];

    setupAlienFormation();
  };

  // Player shoot
  const playerShoot = () => {
    const player = playerRef.current;
    player.bullets.push({
      x: player.x,
      y: player.y - player.h / 2,
      w: 2,
      h: 8,
      direction: 1,
      speed: 1000,
      alive: true,
    });
  };

  // Update player
  const updatePlayer = (dt: number) => {
    const player = playerRef.current;

    player.bulletDelayAccumulator += dt;

    // Handle input
    if (isKeyDown(LEFT_KEY)) {
      player.xVel = -175;
    } else if (isKeyDown(RIGHT_KEY)) {
      player.xVel = 175;
    } else {
      player.xVel = 0;
    }

    if (wasKeyPressed(SHOOT_KEY)) {
      if (player.bulletDelayAccumulator > 0.5) {
        playerShoot();
        player.bulletDelayAccumulator = 0;
      }
    }

    // Update position
    player.x += player.xVel * dt;
    player.x = clamp(player.x, player.w / 2, CANVAS_WIDTH - player.w / 2);

    // Update bullets
    for (let i = player.bullets.length - 1; i >= 0; i--) {
      const bullet = player.bullets[i];
      bullet.y -= bullet.speed * dt;

      if (bullet.y < 0) {
        player.bullets.splice(i, 1);
      }
    }
  };

  // Update aliens
  const updateAliens = (dt: number) => {
    if (updateAlienLogicRef.current) {
      updateAlienLogicRef.current = false;
      alienDirectionRef.current = -alienDirectionRef.current;
      alienYDownRef.current = 25;
    }

    for (let i = aliensRef.current.length - 1; i >= 0; i--) {
      const alien = aliensRef.current[i];
      if (!alien.alive) {
        aliensRef.current.splice(i, 1);
        alienCountRef.current--;
        if (alienCountRef.current < 1) {
          waveRef.current++;
          setupAlienFormation();
        }
        continue;
      }

      alien.stepDelay = (alienCountRef.current * 20 - waveRef.current * 10) / 1000;
      if (alien.stepDelay <= 0.05) {
        alien.stepDelay = 0.05;
      }

      alien.stepAccumulator += dt;

      if (alien.stepAccumulator >= alien.stepDelay) {
        if (alien.x < alien.w / 2 + 20 && alienDirectionRef.current < 0) {
          updateAlienLogicRef.current = true;
        }
        if (alienDirectionRef.current === 1 && alien.x > CANVAS_WIDTH - alien.w / 2 - 20) {
          updateAlienLogicRef.current = true;
        }
        if (alien.y > CANVAS_HEIGHT - 50) {
          initGame();
          gameStartedRef.current = false;
        }

        // Random shoot
        if (Math.random() * 1000 <= 5 * (alien.stepDelay + 1)) {
          alien.bullet = {
            x: alien.x,
            y: alien.y + alien.h / 2,
            w: 2,
            h: 8,
            direction: -1,
            speed: 500,
            alive: true,
          };
        }

        alien.x += 10 * alienDirectionRef.current;
        alien.currentFrame = alien.currentFrame === 0 ? 1 : 0;
        alien.stepAccumulator = 0;
      }

      alien.y += alienYDownRef.current;

      // Update alien bullet
      if (alien.bullet && alien.bullet.alive) {
        alien.bullet.y -= alien.bullet.speed * alien.bullet.direction * dt;
        if (alien.bullet.y > CANVAS_HEIGHT) {
          alien.bullet = null;
        }
      }
    }

    alienYDownRef.current = 0;
  };

  // Create explosion
  const createExplosion = (x: number, y: number, color: string, number: number, width: number, height: number, speed: number, gravity: number, life: number) => {
    for (let i = 0; i < number; i++) {
      const angle = Math.floor(Math.random() * 360);
      const spd = Math.floor(Math.random() * speed / 2) + speed;
      const lif = Math.floor(Math.random() * life) + life / 2;
      const radians = (angle * Math.PI) / 180;
      const xunits = Math.cos(radians) * spd;
      const yunits = Math.sin(radians) * spd;

      particlesRef.current.push({
        x,
        y,
        xunits,
        yunits,
        life: lif,
        maxLife: lif,
        color,
        width,
        height,
        gravity,
        moves: 0,
      });
    }
  };

  // Resolve collisions
  const resolveCollisions = () => {
    const player = playerRef.current;

    // Player bullets vs aliens
    for (let i = player.bullets.length - 1; i >= 0; i--) {
      const bullet = player.bullets[i];
      for (let j = aliensRef.current.length - 1; j >= 0; j--) {
        const alien = aliensRef.current[j];
        if (checkRectCollision(
          { x: bullet.x - 1, y: bullet.y, w: bullet.w, h: bullet.h },
          { x: alien.x - alien.w / 2, y: alien.y - alien.h / 2, w: alien.w, h: alien.h }
        )) {
          alien.alive = false;
          player.bullets.splice(i, 1);
          player.score += 25;
          createExplosion(alien.x, alien.y, 'white', 70, 5, 5, 3, 0.15, 50);
          break;
        }
      }
    }

    // Alien bullets vs player
    for (const alien of aliensRef.current) {
      if (alien.bullet && alien.bullet.alive) {
        if (checkRectCollision(
          { x: alien.bullet.x - 1, y: alien.bullet.y, w: alien.bullet.w, h: alien.bullet.h },
          { x: player.x - player.w / 2, y: player.y - player.h / 2, w: player.w, h: player.h }
        )) {
          alien.bullet.alive = false;
          alien.bullet = null;
          player.lives--;
          createExplosion(player.x, player.y, 'green', 100, 8, 8, 6, 0.001, 40);
          player.x = CANVAS_WIDTH / 2;

          if (player.lives === 0) {
            gameStartedRef.current = false;
          }
          break;
        }
      }
    }
  };

  // Draw sprite from sheet
  const drawSprite = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, clipRect: ClipRect, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.drawImage(
      img,
      clipRect.x,
      clipRect.y,
      clipRect.w,
      clipRect.h,
      -clipRect.w / 2,
      -clipRect.h / 2,
      clipRect.w,
      clipRect.h
    );
    ctx.restore();
  };

  // Draw game
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const spriteSheet = spriteSheetImgRef.current;

    if (!spriteSheet) return;

    // Clear
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player
    drawSprite(ctx, spriteSheet, PLAYER_CLIP_RECT, player.x, player.y, 0.85);

    // Draw player bullets
    ctx.fillStyle = 'white';
    player.bullets.forEach(bullet => {
      ctx.fillRect(bullet.x - 1, bullet.y, bullet.w, bullet.h);
    });

    // Draw aliens
    aliensRef.current.forEach(alien => {
      if (alien.alive) {
        const clipRect = alien.clipRects[alien.currentFrame];
        drawSprite(ctx, spriteSheet, clipRect, alien.x, alien.y, 0.5);

        // Draw alien bullet
        if (alien.bullet && alien.bullet.alive) {
          ctx.fillStyle = 'white';
          ctx.fillRect(alien.bullet.x - 1, alien.bullet.y, alien.bullet.w, alien.bullet.h);
        }
      }
    });

    // Draw particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.moves++;
      particle.x += particle.xunits;
      particle.y += particle.yunits + particle.gravity * particle.moves;
      particle.life--;

      if (particle.life <= 0) {
        particlesRef.current.splice(i, 1);
      } else {
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
        ctx.globalAlpha = 1;
      }
    }

    // Draw HUD
    ctx.fillStyle = '#02ff12';
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 2);

    ctx.fillStyle = 'white';
    ctx.font = '20px monospace';
    ctx.fillText(`${player.lives} x`, 10, CANVAS_HEIGHT - 7.5);

    // Draw small player icon
    ctx.drawImage(
      spriteSheet,
      PLAYER_CLIP_RECT.x,
      PLAYER_CLIP_RECT.y,
      PLAYER_CLIP_RECT.w,
      PLAYER_CLIP_RECT.h,
      45,
      CANVAS_HEIGHT - 23,
      PLAYER_CLIP_RECT.w * 0.5,
      PLAYER_CLIP_RECT.h * 0.5
    );

    ctx.fillText('CREDIT:', CANVAS_WIDTH - 115, CANVAS_HEIGHT - 7.5);

    // Centered score
    const scoreText = `SCORE: ${player.score}`;
    const metrics = ctx.measureText(scoreText);
    ctx.fillText(scoreText, CANVAS_WIDTH / 2 - metrics.width / 2, 20);

    // Blinking credit
    if (Math.floor(Date.now() / 500) % 2) {
      ctx.fillText('00', CANVAS_WIDTH - 40, CANVAS_HEIGHT - 7.5);
    }
  };

  // Draw start screen
  const drawStartScreen = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';

    ctx.fillText('Space Invaders', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2.75);

    if (Math.floor(Date.now() / 500) % 2) {
      ctx.fillText('Press Enter to play!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

    ctx.textAlign = 'left';
  };

  // Game loop
  const gameLoop = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = now - lastTimeRef.current;
    const cappedDt = Math.min(dt, 100);
    lastTimeRef.current = now;

    // Check for enter key to start
    if (wasKeyPressed(ENTER_KEY) && !gameStartedRef.current) {
      initGame();
      gameStartedRef.current = true;
    }

    if (gameStartedRef.current) {
      updatePlayer(cappedDt / 1000);
      updateAliens(cappedDt / 1000);
      resolveCollisions();
      drawGame(ctx);
    } else {
      drawStartScreen(ctx);
    }

    prevKeyStatesRef.current = [...keyStatesRef.current];
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // Event handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    keyStatesRef.current[e.keyCode] = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    e.preventDefault();
    keyStatesRef.current[e.keyCode] = false;
  };

  useEffect(() => {
    // Load sprite sheet
    const spriteSheet = new Image();
    spriteSheet.src = SPRITE_SHEET_SRC;
    spriteSheet.onload = () => {
      spriteSheetImgRef.current = spriteSheet;
    };

    // Create bullet image
    bulletImgRef.current = createBulletImage();

    // Setup event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start game loop
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#222',
      margin: 0,
      padding: '20px'
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '2px solid #02ff12',
          maxWidth: '100%',
          height: 'auto',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}
