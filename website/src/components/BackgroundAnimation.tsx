import React, { useEffect, useRef } from 'react';

export const BackgroundAnimation: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const dots: { x: number; y: number; vx: number; vy: number; r: number; phase: number }[] = [];
        const dotCount = 60; // Increased density

        // Sphere-like distribution
        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3, // Slower, more elegant
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }

        let mouseX = width / 2;
        let mouseY = height / 2;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Subtle glow in center (The "Earth" core)
            const gradient = ctx.createRadialGradient(
                width / 2 + (mouseX - width / 2) * 0.05,
                height / 2 + (mouseY - height / 2) * 0.05,
                0,
                width / 2,
                height / 2,
                width > height ? width * 0.4 : height * 0.4
            );

            const isDark = document.documentElement.classList.contains('dark');
            gradient.addColorStop(0, isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw connecting dots (The Network)
            dots.forEach((dot, i) => {
                dot.x += dot.vx;
                dot.y += dot.vy;
                dot.phase += 0.01;

                if (dot.x < 0) dot.x = width;
                if (dot.x > width) dot.x = 0;
                if (dot.y < 0) dot.y = height;
                if (dot.y > height) dot.y = 0;

                const opacityMult = 0.5 + Math.sin(dot.phase) * 0.5;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.r * (0.8 + opacityMult * 0.4), 0, Math.PI * 2);
                ctx.fillStyle = isDark ? `rgba(59, 130, 246, ${0.6 * opacityMult})` : `rgba(37, 99, 235, ${0.4 * opacityMult})`;
                ctx.fill();

                for (let j = i + 1; j < dots.length; j++) {
                    const dot2 = dots[j];
                    const dist = Math.sqrt((dot.x - dot2.x) ** 2 + (dot.y - dot2.y) ** 2);
                    if (dist < 250) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(dot2.x, dot2.y);
                        const alpha = 1 - dist / 250;
                        ctx.strokeStyle = isDark ? `rgba(59, 130, 246, ${0.3 * alpha})` : `rgba(37, 99, 235, ${0.2 * alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Mouse interaction
                const distToMouse = Math.sqrt((dot.x - mouseX) ** 2 + (dot.y - mouseY) ** 2);
                if (distToMouse < 300) {
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouseX, mouseY);
                    const alpha = 1 - distToMouse / 300;
                    ctx.strokeStyle = isDark ? `rgba(59, 130, 246, ${0.25 * alpha})` : `rgba(37, 99, 235, ${0.15 * alpha})`;
                    ctx.stroke();
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-80 transition-opacity duration-1000"
        />
    );
};
