import React, { useEffect, useRef, useState } from 'react';
import { Gamepad2, RotateCcw, Trophy, Zap } from 'lucide-react';

export const Play: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [lives, setLives] = useState(3);

    useEffect(() => {
        const saved = localStorage.getItem('urja-game-highscore');
        if (saved) setHighScore(parseInt(saved));
    }, []);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let mouseX = canvas.width / 2;
        let mouseY = canvas.height / 2;
        let animationId: number;

        // Game entities
        interface Entity {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            color: string;
            label: string;
            rotation: number;
        }

        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 25,
            trail: [] as { x: number; y: number; alpha: number }[]
        };

        const modules: Entity[] = [];
        const bugs: Entity[] = [];
        const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

        const moduleColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const moduleLabels = ['React', 'Vue', 'Solid', 'Svelte', 'Angular'];

        // Spawn modules
        const spawnModule = () => {
            const side = Math.floor(Math.random() * 4);
            let x, y, vx, vy;

            switch (side) {
                case 0: // top
                    x = Math.random() * canvas.width;
                    y = -30;
                    vx = (Math.random() - 0.5) * 2;
                    vy = 1 + level * 0.3;
                    break;
                case 1: // right
                    x = canvas.width + 30;
                    y = Math.random() * canvas.height;
                    vx = -(1 + level * 0.3);
                    vy = (Math.random() - 0.5) * 2;
                    break;
                case 2: // bottom
                    x = Math.random() * canvas.width;
                    y = canvas.height + 30;
                    vx = (Math.random() - 0.5) * 2;
                    vy = -(1 + level * 0.3);
                    break;
                default: // left
                    x = -30;
                    y = Math.random() * canvas.height;
                    vx = 1 + level * 0.3;
                    vy = (Math.random() - 0.5) * 2;
            }

            const idx = Math.floor(Math.random() * moduleLabels.length);
            modules.push({
                x, y, vx, vy,
                radius: 20,
                color: moduleColors[idx],
                label: moduleLabels[idx],
                rotation: 0
            });
        };

        // Spawn bugs
        const spawnBug = () => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.max(canvas.width, canvas.height);
            bugs.push({
                x: canvas.width / 2 + Math.cos(angle) * distance,
                y: canvas.height / 2 + Math.sin(angle) * distance,
                vx: -Math.cos(angle) * (2 + level * 0.5),
                vy: -Math.sin(angle) * (2 + level * 0.5),
                radius: 18,
                color: '#ef4444',
                label: 'BUG',
                rotation: 0
            });
        };

        // Create particles
        const createParticles = (x: number, y: number, color: string, count: number = 15) => {
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * (2 + Math.random() * 3),
                    vy: Math.sin(angle) * (2 + Math.random() * 3),
                    life: 1,
                    color
                });
            }
        };

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        // Game intervals
        const moduleInterval = setInterval(spawnModule, 1000 - level * 50);
        const bugInterval = setInterval(spawnBug, 3000 - level * 100);

        // Game loop
        const gameLoop = () => {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Smooth player movement
            player.x += (mouseX - player.x) * 0.15;
            player.y += (mouseY - player.y) * 0.15;

            // Trail effect
            player.trail.unshift({ x: player.x, y: player.y, alpha: 1 });
            if (player.trail.length > 15) player.trail.pop();
            player.trail.forEach((t, i) => {
                t.alpha -= 0.07;
                ctx.beginPath();
                ctx.arc(t.x, t.y, player.radius * (1 - i * 0.03), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${t.alpha * 0.3})`;
                ctx.fill();
            });

            // Draw player (Urja Core)
            ctx.save();
            ctx.translate(player.x, player.y);

            // Glow effect
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, player.radius * 2);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, player.radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // Core circle
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
            ctx.fill();

            // Urja logo
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', 0, 0);

            ctx.restore();

            // Update and draw modules
            modules.forEach((mod, i) => {
                mod.x += mod.vx;
                mod.y += mod.vy;
                mod.rotation += 0.05;

                const dist = Math.hypot(mod.x - player.x, mod.y - player.y);
                if (dist < player.radius + mod.radius) {
                    setScore(s => {
                        const newScore = s + 10 * level;
                        if (newScore > highScore) {
                            setHighScore(newScore);
                            localStorage.setItem('urja-game-highscore', newScore.toString());
                        }
                        if (newScore % 100 === 0) {
                            setLevel(l => l + 1);
                        }
                        return newScore;
                    });
                    createParticles(mod.x, mod.y, mod.color);
                    modules.splice(i, 1);
                    return;
                }

                // Draw module
                ctx.save();
                ctx.translate(mod.x, mod.y);
                ctx.rotate(mod.rotation);

                // Glow
                const modGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, mod.radius * 1.5);
                modGlow.addColorStop(0, mod.color);
                modGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = modGlow;
                ctx.beginPath();
                ctx.arc(0, 0, mod.radius * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Hexagon shape
                ctx.fillStyle = mod.color;
                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const angle = (Math.PI / 3) * j;
                    const x = Math.cos(angle) * mod.radius;
                    const y = Math.sin(angle) * mod.radius;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();

                // Label
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(mod.label, 0, 0);

                ctx.restore();

                // Remove if off-screen
                if (mod.x < -50 || mod.x > canvas.width + 50 || mod.y < -50 || mod.y > canvas.height + 50) {
                    modules.splice(i, 1);
                }
            });

            // Update and draw bugs
            bugs.forEach((bug, i) => {
                bug.x += bug.vx;
                bug.y += bug.vy;
                bug.rotation += 0.1;

                const dist = Math.hypot(bug.x - player.x, bug.y - player.y);
                if (dist < player.radius + bug.radius) {
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setGameState('gameover');
                            clearInterval(moduleInterval);
                            clearInterval(bugInterval);
                        }
                        return newLives;
                    });
                    createParticles(bug.x, bug.y, '#ef4444', 20);
                    bugs.splice(i, 1);
                    return;
                }

                // Draw bug
                ctx.save();
                ctx.translate(bug.x, bug.y);
                ctx.rotate(bug.rotation);

                // Danger glow
                const bugGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, bug.radius * 2);
                bugGlow.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
                bugGlow.addColorStop(1, 'transparent');
                ctx.fillStyle = bugGlow;
                ctx.beginPath();
                ctx.arc(0, 0, bug.radius * 2, 0, Math.PI * 2);
                ctx.fill();

                // Bug body
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(0, 0, bug.radius, 0, Math.PI * 2);
                ctx.fill();

                // X mark
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-8, -8);
                ctx.lineTo(8, 8);
                ctx.moveTo(8, -8);
                ctx.lineTo(-8, 8);
                ctx.stroke();

                ctx.restore();

                // Remove if off-screen
                if (bug.x < -50 || bug.x > canvas.width + 50 || bug.y < -50 || bug.y > canvas.height + 50) {
                    bugs.splice(i, 1);
                }
            });

            // Update and draw particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // gravity
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    return;
                }

                ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba');
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            cancelAnimationFrame(animationId);
            clearInterval(moduleInterval);
            clearInterval(bugInterval);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [gameState, level, highScore]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLevel(1);
        setLives(3);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

            {gameState === 'menu' && (
                <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="mb-8 flex justify-center">
                        <div className="p-6 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/50 animate-bounce">
                            <Gamepad2 size={64} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-6xl font-black font-display mb-4 text-white tracking-tight">
                        Dependency Defender
                    </h1>
                    <p className="text-xl text-blue-200 mb-8 max-w-md mx-auto leading-relaxed">
                        Collect framework modules while avoiding bugs. Build the perfect dependency graph!
                    </p>
                    <div className="flex flex-col gap-4 items-center">
                        <button
                            onClick={startGame}
                            className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-blue-500/50 hover:scale-105 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Zap size={24} />
                            Start Game
                        </button>
                        {highScore > 0 && (
                            <div className="flex items-center gap-2 text-yellow-400 font-bold">
                                <Trophy size={20} />
                                High Score: {highScore}
                            </div>
                        )}
                    </div>
                    <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 max-w-md mx-auto backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2 justify-center">
                            <Gamepad2 size={18} />
                            How to Play
                        </h3>
                        <ul className="text-sm text-slate-300 space-y-2 text-left">
                            <li>🖱️ Move your mouse to control the Urja Core</li>
                            <li>⚡ Collect framework modules (hexagons) to gain points</li>
                            <li>❌ Avoid red bugs that break your build</li>
                            <li>🎯 Each level increases speed and difficulty</li>
                            <li>❤️ You have 3 lives - don't waste them!</li>
                        </ul>
                    </div>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="relative z-10 w-full max-w-5xl">
                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
                        <div className="bg-slate-900/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-700 shadow-xl">
                            <div className="text-xs text-slate-400 mb-1">SCORE</div>
                            <div className="text-3xl font-black text-white font-display">{score}</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-slate-900/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-700 shadow-xl">
                                <div className="text-xs text-slate-400 mb-1">LEVEL</div>
                                <div className="text-2xl font-black text-blue-400 font-display">{level}</div>
                            </div>
                            <div className="bg-slate-900/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-700 shadow-xl">
                                <div className="text-xs text-slate-400 mb-1">LIVES</div>
                                <div className="flex gap-1">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500' : 'bg-slate-700'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Canvas */}
                    <canvas
                        ref={canvasRef}
                        className="w-full h-[600px] rounded-3xl border-4 border-slate-700 shadow-2xl bg-slate-900 cursor-none"
                    />
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="mb-8">
                        <div className="text-8xl mb-4">💥</div>
                        <h2 className="text-5xl font-black font-display mb-4 text-red-500">
                            BUILD FAILED
                        </h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Your dependency graph collapsed!
                        </p>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 mb-8 max-w-md mx-auto">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Final Score</div>
                                <div className="text-4xl font-black text-white font-display">{score}</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400 mb-2">Level Reached</div>
                                <div className="text-4xl font-black text-blue-400 font-display">{level}</div>
                            </div>
                        </div>
                        {score === highScore && score > 0 && (
                            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold">
                                    <Trophy size={20} />
                                    NEW HIGH SCORE!
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={startGame}
                        className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-lg shadow-2xl shadow-blue-500/50 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <RotateCcw size={24} />
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};
