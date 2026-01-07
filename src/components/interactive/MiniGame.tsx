"use client";
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";

export function MiniGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (!isPlaying || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let playerY = 150;
        let playerVelocity = 0;
        const obstacles: { x: number; width: number; height: number }[] = [];
        const clouds: { x: number; y: number; size: number }[] = [];
        let frameCount = 0;
        let currentScore = 0;

        // Game Constants - Adjusted for "Easier" difficulty
        // Game Constants - Adjusted for "Easier" difficulty
        const GRAVITY = 0.25; // Lower gravity for floaty jumps
        const JUMP_FORCE = -9; // Adjusted jump
        const SPEED = 2.5; // Slower speed
        const GROUND_Y = 160;

        const jump = () => {
            if (playerY >= GROUND_Y - 5) { // Forgiving jump detection
                playerVelocity = JUMP_FORCE;
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") jump();
        };

        const handleClick = () => jump();

        window.addEventListener("keydown", handleKeyDown);
        canvas.addEventListener("mousedown", handleClick);
        canvas.addEventListener("touchstart", handleClick);

        // Initialize clouds
        for (let i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * 100,
                size: Math.random() * 20 + 10
            });
        }

        const gameLoop = () => {
            frameCount++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // --- Draw Background (City Skyline) ---
            // Sky Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#0f172a"); // Slate-900
            gradient.addColorStop(1, "#334155"); // Slate-700
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Moon
            ctx.fillStyle = "#fefce8"; // Yellow-50
            ctx.beginPath();
            ctx.arc(550, 40, 20, 0, Math.PI * 2);
            ctx.fill();

            // Moving Clouds (Parallax)
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            clouds.forEach(cloud => {
                cloud.x -= 0.5;
                if (cloud.x + cloud.size < 0) cloud.x = canvas.width + cloud.size;
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Background Buildings (Silhouettes)
            ctx.fillStyle = "#1e293b"; // Slate-800
            for (let i = 0; i < 10; i++) {
                const h = 50 + (i * 20) % 80;
                const x = ((frameCount * 0.5) + (i * 100)) % (canvas.width + 100) - 100;
                ctx.fillRect(canvas.width - x, canvas.height - h, 80, h);
            }

            // --- Draw Ground (Rooftop) ---
            ctx.fillStyle = "#374151"; // Gray-700
            ctx.fillRect(0, GROUND_Y + 20, canvas.width, canvas.height - (GROUND_Y + 20));
            // Rooftop edge detail
            ctx.fillStyle = "#4b5563"; // Gray-600
            ctx.fillRect(0, GROUND_Y + 20, canvas.width, 10);

            // --- Player Physics ---
            playerVelocity += GRAVITY;
            playerY += playerVelocity;

            if (playerY > GROUND_Y) {
                playerY = GROUND_Y;
                playerVelocity = 0;
            }

            // --- Draw Player (Spiderman Style) ---
            const pX = 50;
            const pSize = 30;

            // Legs (Simple animation)
            ctx.strokeStyle = "#1d4ed8"; // Blue-700
            ctx.lineWidth = 4;
            ctx.beginPath();
            if (playerY < GROUND_Y) {
                // Jumping pose
                ctx.moveTo(pX + 10, playerY + 20);
                ctx.lineTo(pX + 5, playerY + 35);
                ctx.moveTo(pX + 20, playerY + 20);
                ctx.lineTo(pX + 25, playerY + 30);
            } else {
                // Running pose
                const stride = Math.sin(frameCount * 0.2) * 10;
                ctx.moveTo(pX + 15, playerY + 20);
                ctx.lineTo(pX + 5 + stride, playerY + 35);
                ctx.moveTo(pX + 15, playerY + 20);
                ctx.lineTo(pX + 25 - stride, playerY + 35);
            }
            ctx.stroke();

            // Body
            ctx.fillStyle = "#ef4444"; // Red-500
            ctx.fillRect(pX + 5, playerY + 10, 20, 20); // Torso

            // Blue sides
            ctx.fillStyle = "#1d4ed8"; // Blue-700
            ctx.fillRect(pX + 5, playerY + 15, 5, 15);
            ctx.fillRect(pX + 20, playerY + 15, 5, 15);

            // Head
            ctx.fillStyle = "#ef4444"; // Red-500
            ctx.beginPath();
            ctx.arc(pX + 15, playerY + 5, 10, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(pX + 11, playerY + 5, 3, 4, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(pX + 19, playerY + 5, 3, 4, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();


            // --- Obstacle Logic ---
            // Spawning - Less frequent for easier difficulty
            if (frameCount % 150 === 0) {
                // Randomize obstacle type (Vent or Antenna)
                const type = Math.random() > 0.5 ? 'vent' : 'antenna';
                obstacles.push({
                    x: canvas.width,
                    width: type === 'vent' ? 30 : 10,
                    height: type === 'vent' ? 25 : 40
                });
            }

            // Draw & Move Obstacles
            obstacles.forEach((obs, index) => {
                obs.x -= SPEED;

                // Draw Obstacle
                ctx.fillStyle = "#94a3b8"; // Slate-400 (Metal)
                ctx.fillRect(obs.x, GROUND_Y + 20 - obs.height, obs.width, obs.height);

                // Detail (Vent slats or Antenna top)
                ctx.fillStyle = "#64748b";
                if (obs.width > 15) { // Vent
                    ctx.fillRect(obs.x + 5, GROUND_Y + 20 - obs.height + 5, obs.width - 10, 5);
                    ctx.fillRect(obs.x + 5, GROUND_Y + 20 - obs.height + 15, obs.width - 10, 5);
                } else { // Antenna
                    ctx.beginPath();
                    ctx.arc(obs.x + obs.width / 2, GROUND_Y + 20 - obs.height, 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Collision Detection - Slightly forgiving hitbox
                const hitboxPadding = 5;
                if (
                    pX + hitboxPadding < obs.x + obs.width &&
                    pX + pSize - hitboxPadding > obs.x &&
                    playerY + hitboxPadding < GROUND_Y + 20 &&
                    playerY + pSize - hitboxPadding > GROUND_Y + 20 - obs.height
                ) {
                    setGameOver(true);
                    setIsPlaying(false);
                }

                // Remove off-screen obstacles
                if (obs.x + obs.width < 0) {
                    obstacles.splice(index, 1);
                    currentScore++;
                    setScore(currentScore);
                }
            });

            if (!gameOver) {
                animationFrameId = requestAnimationFrame(gameLoop);
            }
        };

        gameLoop();

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            canvas.removeEventListener("mousedown", handleClick);
            canvas.removeEventListener("touchstart", handleClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying, gameOver]);

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
    };

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-slate-900 p-4 text-white">
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <h3 className="mb-4 text-3xl font-bold text-red-500 drop-shadow-lg">SPIDER-HERO RUN</h3>
                    <Button onClick={startGame} size="lg" className="gap-2 bg-red-600 hover:bg-red-700">
                        <Play className="h-5 w-5" />
                        Start Patrol
                    </Button>
                </div>
            )}

            {gameOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                    <h3 className="mb-2 text-4xl font-bold text-red-500">MISSION FAILED</h3>
                    <p className="mb-6 text-2xl font-mono text-blue-400">Score: {score}</p>
                    <Button onClick={startGame} variant="outline" className="gap-2 border-red-500 text-red-500 hover:bg-red-950">
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={600}
                height={250}
                className="h-full w-full rounded-lg border-2 border-slate-700 bg-slate-900 shadow-2xl"
            />

            {isPlaying && (
                <div className="absolute top-4 right-4 z-10 rounded bg-black/50 px-3 py-1 text-xl font-bold font-mono text-white border border-white/20">
                    SCORE: {score}
                </div>
            )}
        </div>
    );
}
