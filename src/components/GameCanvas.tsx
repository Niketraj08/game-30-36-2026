import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { ProjectConfigs } from '../cppSourceTemplates';

// Web Audio API Synthesizer for Retro SFX
class SoundSynth {
  private ctx: AudioContext | null = null;
  public musicVol: number = 35;
  public soundVol: number = 50;

  constructor() {
    // Lazy initialized on first interaction to comply with browser safety rules
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSound(type: 'shoot' | 'explosion' | 'coin' | 'powerup' | 'hurt' | 'levelclear') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const masterVolume = this.ctx.createGain();
      masterVolume.gain.setValueAtTime((this.soundVol / 100) * 0.15, this.ctx.currentTime);
      masterVolume.connect(this.ctx.destination);

      const now = this.ctx.currentTime;

      if (type === 'shoot') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(masterVolume);
        osc.start(now);
        osc.stop(now + 0.12);
      } 
      else if (type === 'coin') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(masterVolume);
        osc.start(now);
        osc.stop(now + 0.25);
      } 
      else if (type === 'powerup') {
        // Upward arpeggio sweep
        [523, 659, 783, 1046].forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.6, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);
          osc.connect(gain);
          gain.connect(masterVolume);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.15);
        });
      } 
      else if (type === 'hurt') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(masterVolume);
        osc.start(now);
        osc.stop(now + 0.2);
      } 
      else if (type === 'explosion') {
        // Generate white noise explosion
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterVolume);
        noise.start(now);
        noise.stop(now + 0.4);
      }
      else if (type === 'levelclear') {
        const chord = [261.63, 329.63, 392.00, 523.25];
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.8, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.5);
          osc.connect(gain);
          gain.connect(masterVolume);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.5);
        });
      }
    } catch (e) {
      console.warn("Audio Synthesis suspended or failed:", e);
    }
  }
}

const sfx = new SoundSynth();

interface GameCanvasProps {
  configs: ProjectConfigs;
}

type LocalGameState = 'menu' | 'settings' | 'playing' | 'paused' | 'gameover' | 'victory';

export default function GameCanvas({ configs }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<LocalGameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('space_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [musicVol, setMusicVol] = useState(35);
  const [soundVol, setSoundVol] = useState(50);
  const [menuSelection, setMenuSelection] = useState(0);

  // Keep configs and state in refs for performance in high speed canvas loop
  const stateRef = useRef({
    gameState: 'menu' as LocalGameState,
    score: 0,
    coins: 0,
    level: 1,
    player: {
      x: 400,
      y: 750,
      width: 44,
      height: 44,
      health: 3,
      maxHealth: 3,
      lives: 3,
      shieldTime: 0,
      firePowerTime: 0,
      firePowerType: 'normal' as 'normal' | 'rapid' | 'double',
      invulnTime: 0,
      shootCooldown: 0,
    },
    boss: {
      x: 400,
      y: -200,
      width: 140,
      height: 100,
      health: 100,
      maxHealth: 100,
      state: 'destroyed' as 'entering' | 'active' | 'destroyed',
      speed: 130,
      direction: 1, // 1 right, -1 left
      shootCooldown: 0,
      attackPattern: 0,
      patternTimer: 0,
    },
    levelPhase: 'NormalSpawner' as 'NormalSpawner' | 'WarningMessage' | 'BossBattle' | 'LevelCleared',
    levelPhaseTimer: 0,
    enemiesRemainingToSpawn: 15,
    spawnTimer: 0,
    bullets: [] as any[],
    enemies: [] as any[],
    powerups: [] as any[],
    explosions: [] as any[],
    stars: [] as { x: number; y: number; speed: number; size: number }[],
    keys: {} as Record<string, boolean>,
  });

  // Sync state to ref
  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  // Sync customizable settings to inner state ref
  useEffect(() => {
    stateRef.current.player.lives = configs.initialLives;
    stateRef.current.boss.maxHealth = configs.bossMaxHp;
  }, [configs]);

  // Sync sound volume
  useEffect(() => {
    sfx.soundVol = soundVol;
    sfx.musicVol = musicVol;
  }, [soundVol, musicVol]);

  // Initialize stars backdrop
  useEffect(() => {
    const stars: { x: number; y: number; speed: number; size: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 900,
        speed: 30 + Math.random() * 120,
        size: 1 + Math.random() * 2,
      });
    }
    stateRef.current.stars = stars;
  }, []);

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;

      // Menu/State change overrides
      if (stateRef.current.gameState === 'menu') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          sfx.playSound('coin');
          setMenuSelection(prev => (prev - 1 + 3) % 3);
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          sfx.playSound('coin');
          setMenuSelection(prev => (prev + 1) % 3);
        }
        if (e.key === 'Enter') {
          sfx.playSound('powerup');
          triggerMenuAction();
        }
      } else if (stateRef.current.gameState === 'settings') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          sfx.playSound('coin');
          setMenuSelection(prev => (prev - 1 + 3) % 3);
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          sfx.playSound('coin');
          setMenuSelection(prev => (prev + 1) % 3);
        }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          if (menuSelection === 0) setMusicVol(v => Math.max(0, v - 10));
          if (menuSelection === 1) setSoundVol(v => Math.max(0, v - 10));
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          if (menuSelection === 0) setMusicVol(v => Math.min(100, v + 10));
          if (menuSelection === 1) setSoundVol(v => Math.min(100, v + 10));
        }
        if (e.key === 'Enter' && menuSelection === 2) {
          sfx.playSound('powerup');
          setGameState('menu');
          setMenuSelection(0);
        }
      } else if (stateRef.current.gameState === 'playing') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          setGameState('paused');
          sfx.playSound('hurt');
        }
      } else if (stateRef.current.gameState === 'paused') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          setGameState('playing');
          sfx.playSound('powerup');
        }
      } else if (stateRef.current.gameState === 'gameover' || stateRef.current.gameState === 'victory') {
        if (e.key === ' ' || e.key === 'Enter') {
          setGameState('menu');
          setMenuSelection(0);
          sfx.playSound('powerup');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, menuSelection]);

  const triggerMenuAction = () => {
    if (menuSelection === 0) {
      // PLAY
      resetGameEngine();
      setGameState('playing');
    } else if (menuSelection === 1) {
      // SETTINGS
      setGameState('settings');
      setMenuSelection(0);
    } else if (menuSelection === 2) {
      // EXIT (Mimic exit with alert/feedback)
      alert("C++ Applet Closed! (Exiting process simulated)");
    }
  };

  const resetGameEngine = () => {
    const s = stateRef.current;
    s.score = 0;
    s.coins = 0;
    s.level = 1;
    s.levelPhase = 'NormalSpawner';
    s.levelPhaseTimer = 0;
    s.enemiesRemainingToSpawn = 15;
    s.bullets = [];
    s.enemies = [];
    s.powerups = [];
    s.explosions = [];
    s.spawnTimer = 0;

    s.player = {
      x: 400,
      y: 750,
      width: 44,
      height: 44,
      health: 3,
      maxHealth: 3,
      lives: configs.initialLives,
      shieldTime: 0,
      firePowerTime: 0,
      firePowerType: 'normal',
      invulnTime: 0,
      shootCooldown: 0,
    };

    s.boss = {
      x: 400,
      y: -200,
      width: 140,
      height: 100,
      health: configs.bossMaxHp,
      maxHealth: configs.bossMaxHp,
      state: 'destroyed',
      speed: 130,
      direction: 1,
      shootCooldown: 0,
      attackPattern: 0,
      patternTimer: 0,
    };

    setScore(0);
    setCoins(0);
    setLevel(1);
  };

  // Main canvas drawing & update engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      let dt = (time - lastTime) / 1000;
      lastTime = time;

      // Safety limit
      if (dt > 0.1) dt = 0.1;

      update(dt);
      draw(ctx);

      animId = requestAnimationFrame(loop);
    };

    const update = (dt: number) => {
      const s = stateRef.current;

      // 1. Update Scrolling Starfield
      s.stars.forEach(star => {
        star.y += star.speed * dt;
        if (star.y > 900) {
          star.y = -10;
          star.x = Math.random() * 800;
        }
      });

      if (s.gameState !== 'playing') return;

      // 2. Update Player Ship Movement
      let dx = 0;
      let dy = 0;
      if (s.keys['w'] || s.keys['arrowup']) dy -= 1;
      if (s.keys['s'] || s.keys['arrowdown']) dy += 1;
      if (s.keys['a'] || s.keys['arrowleft']) dx -= 1;
      if (s.keys['d'] || s.keys['arrowright']) dx += 1;

      // Normalize diagonal movement speed
      const len = Math.sqrt(dx * dx + dy * dy);
      const moveSpeed = configs.playerSpeed;
      if (len > 0) {
        s.player.x += (dx / len) * moveSpeed * dt;
        s.player.y += (dy / len) * moveSpeed * dt;
      }

      // Keep within viewport boundaries
      s.player.x = Math.max(22, Math.min(800 - 22, s.player.x));
      s.player.y = Math.max(22, Math.min(900 - 22, s.player.y));

      // 3. Player Shoot logic
      if (s.player.shootCooldown > 0) {
        s.player.shootCooldown -= dt;
      }

      if (s.keys[' '] && s.player.shootCooldown <= 0) {
        const cooldown = s.player.firePowerType === 'rapid' ? configs.fireRate * 0.4 : configs.fireRate;
        s.player.shootCooldown = cooldown;
        sfx.playSound('shoot');

        if (s.player.firePowerType === 'double') {
          s.bullets.push({ x: s.player.x - 15, y: s.player.y - 12, vx: 0, vy: -650, isPlayer: true, color: '#facc15' });
          s.bullets.push({ x: s.player.x + 15, y: s.player.y - 12, vx: 0, vy: -650, isPlayer: true, color: '#facc15' });
        } else {
          const bColor = s.player.firePowerType === 'rapid' ? '#f87171' : '#22d3ee';
          s.bullets.push({ x: s.player.x, y: s.player.y - 20, vx: 0, vy: -650, isPlayer: true, color: bColor });
        }
      }

      // Invulnerable flashes and powerups
      if (s.player.invulnTime > 0) s.player.invulnTime -= dt;
      if (s.player.shieldTime > 0) s.player.shieldTime -= dt;
      if (s.player.firePowerTime > 0) {
        s.player.firePowerTime -= dt;
        if (s.player.firePowerTime <= 0) {
          s.player.firePowerType = 'normal';
        }
      }

      // 4. Update Level Phase State Machine
      s.levelPhaseTimer += dt;
      if (s.levelPhase === 'NormalSpawner') {
        if (s.enemiesRemainingToSpawn <= 0 && s.enemies.length === 0) {
          s.levelPhase = 'WarningMessage';
          s.levelPhaseTimer = 0;
          sfx.playSound('hurt'); // Alarm warning sound
        } else {
          // Normal spawning logic
          s.spawnTimer += dt;
          const spawnInterval = Math.max(0.6, 2.0 - s.level * 0.15);
          if (s.spawnTimer >= spawnInterval && s.enemiesRemainingToSpawn > 0) {
            s.spawnTimer = 0;
            s.enemiesRemainingToSpawn--;

            const dice = Math.random() * 100;
            let type: 'basic' | 'fast' | 'zigzag' = 'basic';
            if (dice > 70) type = 'fast';
            else if (dice > 45) type = 'zigzag';

            s.enemies.push({
              x: 50 + Math.random() * 700,
              y: -50,
              type,
              speed: configs.enemySpeed * (type === 'fast' ? 1.6 : type === 'zigzag' ? 0.9 : 1.0),
              health: type === 'zigzag' ? 2 : 1,
              scoreValue: type === 'fast' ? 150 : type === 'zigzag' ? 250 : 100,
              shootTimer: Math.random() * 2,
              shootInterval: type === 'fast' ? 4.0 : type === 'zigzag' ? 1.8 : 2.5,
              amplitude: 150,
              timeAccumulated: 0,
            });
          }
        }
      } 
      else if (s.levelPhase === 'WarningMessage') {
        if (s.levelPhaseTimer >= 3.0) {
          s.levelPhase = 'BossBattle';
          s.levelPhaseTimer = 0;
          s.boss.state = 'entering';
          s.boss.x = 400;
          s.boss.y = -100;
          s.boss.health = s.boss.maxHealth;
        }
      } 
      else if (s.levelPhase === 'BossBattle') {
        const b = s.boss;
        if (b.state === 'entering') {
          b.y += 120 * dt;
          if (b.y >= 180) {
            b.state = 'active';
          }
        } else if (b.state === 'active') {
          // Horizontal bobbing motion
          b.x += b.speed * b.direction * dt;
          if (b.x > 700) {
            b.direction = -1;
          } else if (b.x < 100) {
            b.direction = 1;
          }
          b.y = 180 + Math.sin(s.levelPhaseTimer * 2) * 15;

          // Attack patterns cooldown cycle
          b.patternTimer += dt;
          if (b.patternTimer >= 8.0) {
            b.patternTimer = 0;
            b.attackPattern = (b.attackPattern + 1) % 3;
          }

          // Shoots
          b.shootCooldown -= dt;
          const currentInterval = b.attackPattern === 1 ? 2.0 : b.attackPattern === 2 ? 0.4 : 1.2;
          if (b.shootCooldown <= 0) {
            b.shootCooldown = currentInterval;

            if (b.attackPattern === 0) {
              // Wave straight downward spread
              s.bullets.push({ x: b.x - 60, y: b.y + 40, vx: 0, vy: 350, isPlayer: false, color: '#f87171' });
              s.bullets.push({ x: b.x, y: b.y + 45, vx: 0, vy: 350, isPlayer: false, color: '#f87171' });
              s.bullets.push({ x: b.x + 60, y: b.y + 40, vx: 0, vy: 350, isPlayer: false, color: '#f87171' });
            } 
            else if (b.attackPattern === 1) {
              // 8-Way circular radial blast
              for (let i = 0; i < 8; i++) {
                const angle = i * (Math.PI / 4);
                s.bullets.push({
                  x: b.x,
                  y: b.y,
                  vx: Math.cos(angle) * 250,
                  vy: Math.sin(angle) * 250,
                  isPlayer: false,
                  color: '#fb7185',
                });
              }
            } 
            else if (b.attackPattern === 2) {
              // Fast direct spray tracking player coordinate
              const dx = s.player.x - b.x;
              const dy = s.player.y - b.y;
              const dLen = Math.sqrt(dx * dx + dy * dy);
              if (dLen > 0) {
                s.bullets.push({
                  x: b.x,
                  y: b.y + 40,
                  vx: (dx / dLen) * 400,
                  vy: (dy / dLen) * 400,
                  isPlayer: false,
                  color: '#ef4444',
                });
              }
            }
          }
        }
      } 
      else if (s.levelPhase === 'LevelCleared') {
        if (s.levelPhaseTimer >= 4.0) {
          s.level++;
          s.levelPhase = 'NormalSpawner';
          s.enemiesRemainingToSpawn = 15 + s.level * 5;
          s.levelPhaseTimer = 0;
          s.spawnTimer = 0;
          setLevel(s.level);
        }
      }

      // 5. Update Bullets
      s.bullets.forEach(b => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      });
      s.bullets = s.bullets.filter(b => b.y > -50 && b.y < 950 && b.x > -50 && b.x < 850);

      // 6. Update Enemies
      s.enemies.forEach(e => {
        e.timeAccumulated += dt;
        if (e.type === 'zigzag') {
          e.x += Math.sin(e.timeAccumulated * 3.0) * e.amplitude * dt;
          e.y += e.speed * dt;
        } else if (e.type === 'fast') {
          // Slide slowly towards player on X
          if (e.x < s.player.x - 10) e.x += e.speed * 0.3 * dt;
          else if (e.x > s.player.x + 10) e.x -= e.speed * 0.3 * dt;
          e.y += e.speed * dt;
        } else {
          e.y += e.speed * dt;
        }

        // Enemy shoot cooldown
        e.shootTimer += dt;
        if (e.shootTimer >= e.shootInterval) {
          e.shootTimer = 0;
          s.bullets.push({
            x: e.x,
            y: e.y + 20,
            vx: 0,
            vy: 350,
            isPlayer: false,
            color: '#f87171',
          });
        }
      });

      // Filter off-screen enemies
      const beforeLength = s.enemies.length;
      s.enemies = s.enemies.filter(e => e.y < 950);
      if (beforeLength !== s.enemies.length) {
        // Enemies that passed through deal brief damage or deduct score
        s.score = Math.max(0, s.score - 50);
        setScore(s.score);
      }

      // 7. Update Power-ups
      s.powerups.forEach(p => {
        p.y += 120 * dt;
      });
      s.powerups = s.powerups.filter(p => p.y < 950);

      // 8. Update Explosion Particles
      s.explosions.forEach(exp => {
        exp.timer += dt;
        exp.particles.forEach((pt: any) => {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.alpha -= dt * 2;
        });
      });
      s.explosions = s.explosions.filter(exp => exp.timer < 0.5);

      // 9. Handle Intersections & Collisions
      handleIntersections();
    };

    const handleIntersections = () => {
      const s = stateRef.current;

      // Bullet-Enemy Collisions
      s.bullets.forEach((b, bIdx) => {
        if (!b.isPlayer) return;

        s.enemies.forEach((e, eIdx) => {
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < 28) {
            // Explode enemy
            b.y = -9999; // mark bullet for removal
            e.health--;

            if (e.health <= 0) {
              e.y = 9999; // mark enemy for removal
              s.score += e.scoreValue;
              setScore(s.score);
              triggerExplosion(e.x, e.y, '#facc15');
              sfx.playSound('explosion');

              // 30% chance powerup drop
              if (Math.random() < 0.3) {
                const types: any[] = ['shield', 'rapid', 'double', 'health', 'coin'];
                const drop = types[Math.floor(Math.random() * types.length)];
                s.powerups.push({ x: e.x, y: e.y, type: drop });
              }
            } else {
              sfx.playSound('hurt');
            }
          }
        });

        // Bullet-Boss Collisions
        if (s.levelPhase === 'BossBattle' && s.boss.state === 'active') {
          const bDist = Math.hypot(b.x - s.boss.x, b.y - s.boss.y);
          if (bDist < 70) {
            b.y = -9999; // destroy bullet
            s.boss.health--;
            s.score += 50;
            setScore(s.score);

            if (s.boss.health <= 0) {
              s.boss.state = 'destroyed';
              s.levelPhase = 'LevelCleared';
              s.levelPhaseTimer = 0;
              s.score += 5000;
              setScore(s.score);
              triggerExplosion(s.boss.x, s.boss.y, '#ef4444', 35);
              sfx.playSound('levelclear');
            } else {
              sfx.playSound('hurt');
            }
          }
        }
      });

      // Filter dead entities immediately
      s.bullets = s.bullets.filter(b => b.y !== -9999);
      s.enemies = s.enemies.filter(e => e.y !== 9999);

      // Enemy Bullets vs Player Collision
      s.bullets.forEach(b => {
        if (b.isPlayer) return;

        const pDist = Math.hypot(b.x - s.player.x, b.y - s.player.y);
        if (pDist < 24) {
          b.y = 9999; // kill bullet
          damagePlayer();
        }
      });
      s.bullets = s.bullets.filter(b => b.y !== 9999);

      // Enemy Crash vs Player Collision
      s.enemies.forEach(e => {
        const pDist = Math.hypot(e.x - s.player.x, e.y - s.player.y);
        if (pDist < 30) {
          e.y = 9999; // destroy enemy
          damagePlayer();
          triggerExplosion(e.x, e.y, '#e879f9');
          sfx.playSound('explosion');
        }
      });
      s.enemies = s.enemies.filter(e => e.y !== 9999);

      // Player collects Powerups
      s.powerups.forEach((p, pIdx) => {
        const dist = Math.hypot(p.x - s.player.x, p.y - s.player.y);
        if (dist < 28) {
          p.y = 9999; // destroy powerup

          if (p.type === 'shield') {
            s.player.shieldTime = 10;
            sfx.playSound('powerup');
          } else if (p.type === 'rapid') {
            s.player.firePowerType = 'rapid';
            s.player.firePowerTime = 8;
            sfx.playSound('powerup');
          } else if (p.type === 'double') {
            s.player.firePowerType = 'double';
            s.player.firePowerTime = 8;
            sfx.playSound('powerup');
          } else if (p.type === 'health') {
            s.player.health = 3;
            sfx.playSound('powerup');
          } else if (p.type === 'coin') {
            s.coins++;
            s.score += 50;
            setCoins(s.coins);
            setScore(s.score);
            sfx.playSound('coin');
          }
        }
      });
      s.powerups = s.powerups.filter(p => p.y !== 9999);

      // High Score update check
      if (s.score > highScore) {
        setHighScore(s.score);
        try {
          localStorage.setItem('space_high_score', s.score.toString());
        } catch {}
      }
    };

    const damagePlayer = () => {
      const s = stateRef.current;
      if (s.player.invulnTime > 0) return;

      if (s.player.shieldTime > 0) {
        s.player.shieldTime = 0;
        s.player.invulnTime = 1.0;
        sfx.playSound('hurt');
        return;
      }

      s.player.health--;
      sfx.playSound('hurt');

      if (s.player.health <= 0) {
        s.player.lives--;
        if (s.player.lives > 0) {
          s.player.health = 3;
          s.player.x = 400;
          s.player.y = 750;
          s.player.invulnTime = 2.0; // Invulnerable spawn grace
        } else {
          setGameState('gameover');
          sfx.playSound('explosion');
        }
      } else {
        s.player.invulnTime = 1.5;
      }
    };

    const triggerExplosion = (x: number, y: number, color: string, count = 15) => {
      const particles: any[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const mag = 40 + Math.random() * 180;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * mag,
          vy: Math.sin(angle) * mag,
          alpha: 1.0,
          size: 2 + Math.random() * 4,
        });
      }
      stateRef.current.explosions.push({ timer: 0, color, particles });
    };

    const draw = (c: CanvasRenderingContext2D) => {
      const s = stateRef.current;

      // 1. Clear Backdrop
      c.fillStyle = '#030712';
      c.fillRect(0, 0, 800, 900);

      // Grid helper overlay
      c.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      c.lineWidth = 1;
      for (let i = 0; i < 800; i += 50) {
        c.beginPath();
        c.moveTo(i, 0);
        c.lineTo(i, 900);
        c.stroke();
      }
      for (let j = 0; j < 900; j += 50) {
        c.beginPath();
        c.moveTo(0, j);
        c.lineTo(800, j);
        c.stroke();
      }

      // 2. Draw Stars
      c.fillStyle = 'rgba(255, 255, 255, 0.8)';
      s.stars.forEach(star => {
        c.beginPath();
        c.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        c.fill();
      });

      // 3. Draw Game Entities (Only if Playing/Paused/Game Over)
      if (s.gameState !== 'menu' && s.gameState !== 'settings') {
        // Draw Powerups
        s.powerups.forEach(p => {
          c.fillStyle = p.type === 'shield' ? '#22d3ee' : p.type === 'rapid' ? '#f87171' : p.type === 'double' ? '#facc15' : p.type === 'health' ? '#4ade80' : '#f59e0b';
          
          c.save();
          c.translate(p.x, p.y);
          c.beginPath();
          c.arc(0, 0, 10, 0, Math.PI * 2);
          c.fill();
          
          // Outer glow pulsing
          c.strokeStyle = c.fillStyle;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(0, 0, 14, 0, Math.PI * 2);
          c.stroke();
          c.restore();
        });

        // Draw Bullets
        s.bullets.forEach(b => {
          c.fillStyle = b.color;
          c.shadowColor = b.color;
          c.shadowBlur = 8;
          c.beginPath();
          c.arc(b.x, b.y, b.isPlayer ? 4 : 5, 0, Math.PI * 2);
          c.fill();
          c.shadowBlur = 0; // reset
        });

        // Draw Enemies
        s.enemies.forEach(e => {
          c.fillStyle = e.type === 'fast' ? '#f97316' : e.type === 'zigzag' ? '#a855f7' : '#eab308';
          c.strokeStyle = '#ffffff';

          // Triangle alien look
          c.beginPath();
          c.moveTo(e.x, e.y + 18);
          c.lineTo(e.x - 18, e.y - 14);
          c.lineTo(e.x - 6, e.y - 6);
          c.lineTo(e.x + 6, e.y - 6);
          c.lineTo(e.x + 18, e.y - 14);
          c.closePath();
          c.fill();

          // Small warning core
          c.fillStyle = '#ef4444';
          c.beginPath();
          c.arc(e.x, e.y + 2, 4, 0, Math.PI * 2);
          c.fill();
        });

        // Draw Explosions Particles
        s.explosions.forEach(exp => {
          exp.particles.forEach((pt: any) => {
            c.fillStyle = exp.color;
            c.globalAlpha = Math.max(0, pt.alpha);
            c.beginPath();
            c.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            c.fill();
          });
          c.globalAlpha = 1.0;
        });

        // Draw Boss
        if (s.levelPhase === 'BossBattle' && s.boss.state !== 'destroyed') {
          const b = s.boss;
          c.fillStyle = '#ef4444';
          c.shadowColor = '#f43f5e';
          c.shadowBlur = 15;

          // Mega Boss shape
          c.beginPath();
          c.moveTo(b.x, b.y + 50);
          c.lineTo(b.x - 70, b.y - 20);
          c.lineTo(b.x - 40, b.y - 40);
          c.lineTo(b.x + 40, b.y - 40);
          c.lineTo(b.x + 70, b.y - 20);
          c.closePath();
          c.fill();
          c.shadowBlur = 0;

          // Glowing energy lines
          c.strokeStyle = '#ffffff';
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(b.x - 30, b.y + 10);
          c.lineTo(b.x + 30, b.y + 10);
          c.stroke();
        }

        // Draw Player
        const p = s.player;
        const flash = p.invulnTime > 0 && Math.floor(p.invulnTime * 10) % 2 === 0;
        if (!flash) {
          c.fillStyle = '#22d3ee';
          c.shadowColor = '#06b6d4';
          c.shadowBlur = 10;

          // Sleek starfighter design
          c.beginPath();
          c.moveTo(p.x, p.y - 22);
          c.lineTo(p.x - 22, p.y + 18);
          c.lineTo(p.x - 8, p.y + 8);
          c.lineTo(p.x + 8, p.y + 8);
          c.lineTo(p.x + 22, p.y + 18);
          c.closePath();
          c.fill();
          c.shadowBlur = 0;

          // Draw thrust engine fire trail
          c.fillStyle = '#f97316';
          c.beginPath();
          c.moveTo(p.x - 6, p.y + 12);
          c.lineTo(p.x, p.y + 24 + Math.random() * 8);
          c.lineTo(p.x + 6, p.y + 12);
          c.closePath();
          c.fill();
        }

        // Draw Player Active Shield
        if (p.shieldTime > 0) {
          c.strokeStyle = 'rgba(34, 211, 238, 0.8)';
          c.lineWidth = 3;
          c.shadowColor = '#22d3ee';
          c.shadowBlur = 15;
          c.beginPath();
          c.arc(p.x, p.y, 36, 0, Math.PI * 2);
          c.stroke();
          c.shadowBlur = 0;
        }
      }

      // 4. Draw Overlay HUD Screen / Pause / Victory / Game Over
      if (s.gameState === 'menu') {
        drawMainMenu(c);
      } else if (s.gameState === 'settings') {
        drawSettingsMenu(c);
      } else {
        // Draw HUD Text fields
        drawHUDOverlays(c);
      }
    };

    const drawMainMenu = (c: CanvasRenderingContext2D) => {
      // Game Title
      c.fillStyle = '#ffffff';
      c.font = "bold 52px 'Inter', sans-serif";
      c.textAlign = 'center';
      c.fillText("SPACE SHOOTER", 400, 250);

      // High Score Banner
      c.fillStyle = '#facc15';
      c.font = "18px 'Inter', sans-serif";
      c.fillText(`HI-SCORE: ${highScore}`, 400, 310);

      // Playable hint
      c.fillStyle = '#9ca3af';
      c.fillText("Use Arrow keys or W/S to navigate, Enter to select", 400, 750);

      // Navigation Items
      const items = ["PLAY SIMULATOR", "GAME SETTINGS", "SHUTDOWN APP"];
      items.forEach((item, idx) => {
        const isSelected = idx === menuSelection;
        c.fillStyle = isSelected ? '#22d3ee' : '#9ca3af';
        c.font = isSelected ? "bold 28px 'Inter', sans-serif" : "24px 'Inter', sans-serif";
        
        let marker = isSelected ? ">> " : "";
        c.fillText(`${marker}${item}`, 400, 440 + idx * 60);
      });
    };

    const drawSettingsMenu = (c: CanvasRenderingContext2D) => {
      c.fillStyle = '#ffffff';
      c.font = "bold 44px 'Inter', sans-serif";
      c.textAlign = 'center';
      c.fillText("GAME SETTINGS", 400, 250);

      const items = [
        `MUSIC VOLUME:  < ${musicVol}% >`,
        `SOUND VOLUME:  < ${soundVol}% >`,
        "BACK TO MAIN MENU"
      ];

      items.forEach((item, idx) => {
        const isSelected = idx === menuSelection;
        c.fillStyle = isSelected ? '#22d3ee' : '#9ca3af';
        c.font = isSelected ? "bold 26px 'Inter', sans-serif" : "22px 'Inter', sans-serif";
        c.fillText(item, 400, 420 + idx * 60);
      });

      c.fillStyle = '#9ca3af';
      c.font = "15px 'Inter', sans-serif";
      c.fillText("Press Left/Right to adjust values, Enter to return", 400, 700);
    };

    const drawHUDOverlays = (c: CanvasRenderingContext2D) => {
      const s = stateRef.current;

      // Top Left Score
      c.textAlign = 'left';
      c.fillStyle = '#ffffff';
      c.font = "bold 16px 'Inter', sans-serif";
      c.fillText(`SCORE: ${s.score}`, 25, 35);
      c.fillText(`LEVEL: ${s.level}`, 25, 60);

      // Top Right Highscore & Coins
      c.textAlign = 'right';
      c.fillStyle = '#facc15';
      c.fillText(`HI-SCORE: ${highScore}`, 775, 35);
      c.fillStyle = '#fbbf24';
      c.fillText(`COINS: ${s.coins}`, 775, 60);

      // Health bar & Lives indicators
      c.textAlign = 'left';
      c.fillStyle = '#38bdf8';
      c.fillText(`LIVES: ${s.player.lives}`, 25, 840);

      // draw hearts
      c.fillStyle = '#f43f5e';
      const heartX = 25;
      for (let h = 0; h < s.player.health; h++) {
        c.fillText("❤️", heartX + h * 24, 875);
      }

      // Shield active warning indicator
      if (s.player.shieldTime > 0) {
        c.fillStyle = '#22d3ee';
        c.textAlign = 'center';
        c.fillText(`SHIELD ACTIVE: ${s.player.shieldTime.toFixed(1)}s`, 400, 840);
      }

      // Spawning Phases Warnings
      if (s.levelPhase === 'WarningMessage') {
        c.fillStyle = '#ef4444';
        c.font = "bold 32px 'Inter', sans-serif";
        c.textAlign = 'center';
        c.fillText("WARNING: BOSS APPROACHING!", 400, 420);
      }

      // Level Cleared Overlay
      if (s.levelPhase === 'LevelCleared') {
        c.fillStyle = '#4ade80';
        c.font = "bold 36px 'Inter', sans-serif";
        c.textAlign = 'center';
        c.fillText("LEVEL COMPLETED!", 400, 400);
        c.fillStyle = '#ffffff';
        c.font = "18px 'Inter', sans-serif";
        c.fillText("PREPARING ENEMY SECTOR MATRIX FOR HYPERSPACE jump...", 400, 450);
      }

      // Boss Health Bar top display
      if (s.levelPhase === 'BossBattle' && s.boss.state === 'active') {
        c.fillStyle = '#ef4444';
        c.font = "bold 18px 'Inter', sans-serif";
        c.textAlign = 'center';
        c.fillText("BOSS ENEMY SECTOR THREAT", 400, 80);

        // draw outer bar
        c.strokeStyle = '#ef4444';
        c.lineWidth = 2;
        c.strokeRect(200, 100, 400, 14);

        // inner bar scale
        const ratio = s.boss.health / s.boss.maxHealth;
        c.fillStyle = '#ef4444';
        c.fillRect(202, 102, 396 * ratio, 10);
      }

      // Paused Game Dim Screen
      if (s.gameState === 'paused') {
        c.fillStyle = 'rgba(0, 0, 0, 0.75)';
        c.fillRect(0, 0, 800, 900);

        c.fillStyle = '#22d3ee';
        c.font = "bold 40px 'Inter', sans-serif";
        c.textAlign = 'center';
        c.fillText("SIMULATION PAUSED", 400, 400);

        c.fillStyle = '#ffffff';
        c.font = "18px 'Inter', sans-serif";
        c.fillText("PRESS 'P' OR 'ESC' TO RESUME GAMEPLAY", 400, 460);
      }

      // Game Over display overlay
      if (s.gameState === 'gameover') {
        c.fillStyle = 'rgba(15, 23, 42, 0.9)';
        c.fillRect(0, 0, 800, 900);

        c.fillStyle = '#ef4444';
        c.font = "bold 44px 'Inter', sans-serif";
        c.textAlign = 'center';
        c.fillText("MISSION FAILED", 400, 380);

        c.fillStyle = '#ffffff';
        c.font = "20px 'Inter', sans-serif";
        c.fillText(`FINAL SCORE ACQUIRED: ${s.score}`, 400, 440);
        c.fillStyle = '#9ca3af';
        c.fillText("PRESS ENTER OR SPACE KEY TO RESTART MAIN MENU", 400, 500);
      }
    };

    lastTime = performance.now();
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [highScore, configs, musicVol, soundVol, menuSelection]);

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  const handleMenuClick = (idx: number) => {
    sfx.playSound('coin');
    setMenuSelection(idx);
    // Execute action
    setTimeout(() => {
      triggerMenuAction();
    }, 50);
  };

  return (
    <div id="game-canvas-container" className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      
      {/* HUD Header Bar */}
      <div className="w-full flex items-center justify-between px-4 pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-sm tracking-wider text-slate-400">SIMULATOR STATE: <span className="text-cyan-400 font-bold uppercase">{gameState}</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <Volume2 size={14} className="text-cyan-400" />
            <span>SFX: {soundVol}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <Sparkles size={14} className="text-amber-400" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Canvas Element Wrapper for responsive fitting */}
      <div className="relative border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-900 max-w-full" style={{ width: '450px', aspectRatio: '800/900' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={900}
          className="w-full h-full object-cover block cursor-crosshair"
        />

        {/* Floating Controller overlays for mobile / mouse fallback */}
        {gameState === 'playing' && (
          <button
            onClick={togglePause}
            className="absolute top-3 right-3 bg-slate-900/80 hover:bg-cyan-500 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700 hover:border-cyan-400 transition-all cursor-pointer backdrop-blur-sm shadow-md"
            id="pause-button"
            title="Pause game"
          >
            <Pause size={16} />
          </button>
        )}
      </div>

      {/* Instructional Controls Footer Overlay */}
      <div className="w-full mt-4 flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 text-xs text-slate-400 font-mono">
        <div className="flex flex-col gap-1">
          <span className="text-slate-300 font-semibold uppercase">Keyboard Commands:</span>
          <span>🚀 Move: <strong className="text-cyan-400 font-semibold">WASD</strong> or <strong className="text-cyan-400 font-semibold">Arrows</strong></span>
          <span>🔫 Shoot Bullet: <strong className="text-cyan-400 font-semibold">Spacebar</strong></span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-slate-300 font-semibold uppercase">Menu Navigation:</span>
          <span>W/S or Up/Down to Highlight</span>
          <span>Press <strong className="text-cyan-400 font-semibold">Enter</strong> to Confirm</span>
        </div>
      </div>
    </div>
  );
}
