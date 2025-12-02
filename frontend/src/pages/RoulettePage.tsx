import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { getRouletteItems, spinRoulette, RouletteItem, SpinResult } from '@/api/roulette';
import { useAuthStore } from '@/store/authStore';
import { GlobalBackground } from '@/components/GlobalBackground';

// --- STYLES ---
const STYLES = `
/* Стили для Tilda Port */
.tilda-wheel-wrapper * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}



/* Модифицированный wrapper */
.tilda-wheel-wrapper {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
    background: transparent;
    color: #ffffff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 16px;
    overflow-x: hidden;
    position: relative;
    width: 100%;
}

.tilda-wheel-container {
    position: relative;
    width: 100%;
    max-width: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    z-index: 1;
}

.tilda-wheel-header {
    text-align: center;
    margin-bottom: 30px;
    animation: tilda-fadeInDown 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.tilda-wheel-title {
    font-size: clamp(24px, 5vw, 42px);
    font-weight: 900;
    color: #ffffff;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.6);
    line-height: 1.1;
}

.tilda-wheel-subtitle {
    font-size: clamp(15px, 3.5vw, 18px);
    color: #cfd8dc;
    font-weight: 400;
    opacity: 0.9;
    line-height: 1.5;
    max-width: 480px;
    margin: 0 auto;
}

/* ОБОД КОЛЕСА */
.tilda-wheel-wrapper-inner {
    position: relative;
    width: 100%;
    max-width: min(85vw, 500px);
    aspect-ratio: 1 / 1;
    margin: 24px auto 48px;
    animation: tilda-scaleIn 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    
    background: transparent;
    border-radius: 50%;
    box-shadow: 
        0 0 0 6px #263238,
        0 0 0 10px #ff8f00,
        0 0 0 12px rgba(255,255,255,0.2),
        0 0 50px rgba(255, 143, 0, 0.5);
}

.tilda-wheel-shadow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 88%;
    height: 88%;
    box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
    border-radius: 50%;
    z-index: 5;
    pointer-events: none;
}

#tilda-wheelCanvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 88%;
    max-height: 88%;
    border-radius: 50%;
    transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    z-index: 1;
}

/* ЦЕНТРАЛЬНЫЙ КРУГ */
.tilda-wheel-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: clamp(70px, 16vw, 100px);
    height: clamp(70px, 16vw, 100px);
    background: radial-gradient(circle at 30% 30%, #ffffff 0%, #eceff1 40%, #b0bec5 100%);
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 
        0 5px 25px rgba(0,0,0,0.4),
        inset 0 0 10px rgba(255,255,255,1);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(20px, 4.5vw, 30px);
    font-weight: 900;
    color: #ef6c00;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
    letter-spacing: 1px;
    cursor: pointer;
    transition: transform 0.1s;
    user-select: none;
    animation: tilda-pulse-orange 2s infinite;
}
.tilda-wheel-center:hover {
    animation: none;
    transform: translate(-50%, -50%) scale(1.05);
    box-shadow: 0 0 25px rgba(255, 109, 0, 0.6), inset 0 0 10px white;
}
.tilda-wheel-center:active {
    transform: translate(-50%, -50%) scale(0.95);
}

@keyframes tilda-pulse-orange {
    0% { box-shadow: 0 0 0 0 rgba(255, 109, 0, 0.7), inset 0 0 10px white; }
    70% { box-shadow: 0 0 0 15px rgba(255, 109, 0, 0), inset 0 0 10px white; }
    100% { box-shadow: 0 0 0 0 rgba(255, 109, 0, 0), inset 0 0 10px white; }
}

/* СТРЕЛКА */
.tilda-wheel-pointer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -82%);
    width: 54px;
    height: 96px;
    z-index: 15;
    pointer-events: none;
    filter: drop-shadow(0 6px 8px rgba(0,0,0,0.4));
}

.tilda-wheel-pointer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #15232d; 
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}

/* ЛАМПОЧКИ */
.tilda-wheel-lights {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2;
}

.tilda-wheel-light {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fffde7;
    box-shadow: 0 0 8px #fffde7;
    border: 1px solid rgba(0,0,0,0.2);
}
.tilda-wheel-light.white { background: #ffffff; box-shadow: 0 0 12px rgba(255,255,255,0.9); }
.tilda-wheel-light.yellow { background: #fff59d; box-shadow: 0 0 12px rgba(255, 245, 157, 0.9); }

@keyframes tilda-light-glow {
    0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); }
}

@keyframes tilda-tick {
    0% { transform: translate(-50%, -82%) rotate(0deg); }
    50% { transform: translate(-50%, -82%) rotate(-12deg); }
    100% { transform: translate(-50%, -82%) rotate(0deg); }
}

.tilda-wheel-pointer.tick {
    animation: tilda-tick 0.15s ease-in-out;
}

/* Кнопка */
.tilda-spin-button {
    margin-top: 24px;
    padding: clamp(18px, 4vw, 22px) clamp(40px, 10vw, 64px);
    font-size: clamp(16px, 4vw, 20px);
    font-weight: 800;
    color: #fff;
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    border: none;
    border-radius: 60px;
    cursor: pointer;
    box-shadow: 
        0 6px 0 #e65100,
        0 15px 30px rgba(230, 81, 0, 0.3);
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    user-select: none;
    position: relative;
    overflow: hidden;
}
.tilda-spin-button::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.3s, transform 0.3s;
}
.tilda-spin-button:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 9px 0 #e65100, 0 20px 40px rgba(230, 81, 0, 0.4); 
}
.tilda-spin-button:hover::after {
    opacity: 1;
    transform: scale(1);
}
.tilda-spin-button:active { 
    transform: translateY(3px); 
    box-shadow: 0 2px 0 #e65100, 0 5px 10px rgba(230, 81, 0, 0.2); 
}
.tilda-spin-button:disabled { 
    background: #546e7a; 
    color: #cfd8dc; 
    box-shadow: none; 
    cursor: not-allowed; 
    transform: none;
}

/* Modal */
.tilda-prize-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.4s ease, visibility 0.4s ease;
}

.tilda-prize-modal.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}

.tilda-prize-modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.4s ease;
}

.tilda-prize-modal.active .tilda-prize-modal-backdrop {
    opacity: 1;
}

.tilda-prize-modal-content {
    position: relative;
    background: #ffffff;
    color: #263238;
    padding: 40px 30px;
    border-radius: 28px;
    text-align: center;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 25px 80px rgba(0,0,0,0.6);
    z-index: 10000;
    
    transform: scale(0.8) translateY(20px);
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tilda-prize-modal.active .tilda-prize-modal-content {
    transform: scale(1) translateY(0);
    opacity: 1;
}

.tilda-close-modal {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #f5f5f5;
    border: none;
    font-size: 24px;
    line-height: 1;
    color: #90a4ae;
    cursor: pointer;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.tilda-close-modal:hover { background: #eceff1; color: #546e7a; }

.tilda-prize-title { 
    color: #e65100; 
    font-size: clamp(24px, 6vw, 30px); 
    margin-bottom: 12px; 
    text-transform: uppercase; 
    font-weight: 900; 
    line-height: 1.2;
}
.tilda-prize-text { 
    font-size: 17px; 
    color: #546e7a; 
    margin-bottom: 24px; 
    font-weight: 500; 
    line-height: 1.5;
}

.tilda-claim-button {
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 6px 15px rgba(245, 124, 0, 0.4);
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: transform 0.2s, box-shadow 0.2s;
}
.tilda-claim-button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 124, 0, 0.5); }
.tilda-claim-button:active { transform: translateY(1px); box-shadow: 0 2px 10px rgba(245, 124, 0, 0.3); }

/* QR Code Styles */
.tilda-qr-container {
    background: #f5f5f5;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}
.tilda-qr-hint {
    font-size: 13px;
    color: #78909c;
    font-weight: 500;
}

.hidden { display: none !important; }

@keyframes tilda-fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes tilda-scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

@media (max-width: 420px) {
    .tilda-wheel-wrapper { padding: 12px 8px; }
}
@media (max-width: 768px) {
    .hidden-mobile { display: none !important; }
}
`;

export const RoulettePage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);
    const pointerRef = useRef<HTMLDivElement>(null);
    const lightsRef = useRef<HTMLDivElement>(null);

    const [items, setItems] = useState<RouletteItem[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [telegramLink, setTelegramLink] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Animation state refs
    const state = useRef({
        r: 0, // rotation
        t: 0, // target rotation
        b: 0, // begin rotation
        s: 0, // start time
        x: false, // is spinning
        lastIdx: -1,
        id: 0
    });

    // --- COOKIE / STORAGE LOGIC ---
    useEffect(() => {
        const saved = localStorage.getItem('wheel_prize');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.name && parsed.telegramLink) {
                    setSpinResult({ item: { name: parsed.name, index: parsed.index } } as any);
                    setTelegramLink(parsed.telegramLink);
                    setShowModal(true);
                }
            } catch (e) {
                console.error('Failed to parse saved prize', e);
            }
        }
    }, []);

    const savePrize = (prize: any, link: string) => {
        localStorage.setItem('wheel_prize', JSON.stringify({
            name: prize.name,
            index: prize.index,
            telegramLink: link,
            timestamp: Date.now()
        }));
    };

    // --- FETCH ITEMS ---
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getRouletteItems();
                // Custom sort order: 100, 2000, 500, 5000, 1000, 10000
                const customOrder = [100, 2000, 500, 5000, 1000, 10000];
                const sorted = [...data].sort((a, b) => {
                    const indexA = customOrder.indexOf(a.amount);
                    const indexB = customOrder.indexOf(b.amount);
                    // If amount not in custom order, put it at the end
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
                setItems(sorted);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch roulette items', error);
                setIsLoading(false);
            }
        };
        fetchItems();
    }, []);

    // --- DRAWING LOGIC ---
    const draw = () => {
        const cv = canvasRef.current;
        if (!cv || !items.length) return;
        const ctx = cv.getContext('2d');
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const size = cv.width / dpr;
        const center = size / 2;
        const radius = center - 2;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(state.current.r);
        const step = (Math.PI * 2) / items.length;

        // Helper function to lighten/darken colors
        const adjustColor = (hex: string, percent: number) => {
            const num = parseInt(hex.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) + amt;
            const G = (num >> 8 & 0x00FF) + amt;
            const B = (num & 0x0000FF) + amt;
            return '#' + (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            ).toString(16).slice(1).toUpperCase();
        };

        // Helper to determine if color is light or dark
        const isLightColor = (hex: string) => {
            const num = parseInt(hex.replace('#', ''), 16);
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness > 155;
        };

        items.forEach((item, idx) => {
            const start = idx * step;
            const end = start + step;
            const baseColor = item.color || '#FF8C00';

            // Create gradient using server color
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            const lightColor = adjustColor(baseColor, 40);
            const darkColor = adjustColor(baseColor, -20);

            gradient.addColorStop(0, lightColor);
            gradient.addColorStop(0.5, baseColor);
            gradient.addColorStop(1, darkColor);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, start, end);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Highlight
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius * 0.8, start, end);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fill();
            ctx.restore();

            // Separators
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Text
            ctx.save();
            const angle = start + step / 2;
            const fontBase = radius / 10;
            const textRadius = radius * 0.65;

            ctx.translate(Math.cos(angle) * textRadius, Math.sin(angle) * textRadius);
            ctx.rotate(angle + Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Use white text for dark colors, dark text for light colors
            const textColor = isLightColor(baseColor) ? '#263238' : '#ffffff';
            ctx.fillStyle = textColor;

            if (!isLightColor(baseColor)) {
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
            }

            // Format text
            const amount = item.amount.toString();
            ctx.font = `900 ${fontBase * 1.6}px "Arial Black", "Roboto", sans-serif`;
            ctx.fillText(amount, 0, -fontBase * 0.4);

            ctx.font = `700 ${fontBase * 0.65}px "Arial", sans-serif`;
            ctx.fillText("БОНУСОВ", 0, fontBase * 0.8);

            ctx.restore();
        });
        ctx.restore();
    };

    // --- RESIZE ---
    useEffect(() => {
        const resize = () => {
            const cv = canvasRef.current;
            if (!cv || !cv.parentElement) return;

            const box = cv.parentElement.getBoundingClientRect();
            const size = Math.min(box.width, box.height);

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            cv.style.width = `${size}px`;
            cv.style.height = `${size}px`;
            cv.width = size * dpr;
            cv.height = size * dpr;

            const ctx = cv.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            draw();
        };

        window.addEventListener('resize', resize);
        // Initial resize
        if (items.length) {
            resize();
            setTimeout(resize, 100);
        }
        return () => window.removeEventListener('resize', resize);
    }, [items]);

    // --- LIGHTS ---
    useEffect(() => {
        const container = lightsRef.current;
        if (!container || container.children.length > 0) return;

        const numLights = 12;
        const radius = 46;
        for (let i = 0; i < numLights; i++) {
            const light = document.createElement('div');
            light.className = `tilda-wheel-light ${i % 2 === 0 ? 'white' : 'yellow'}`;
            light.style.animation = `tilda-light-glow 1.5s ease-in-out infinite ${i % 2 === 0 ? '0s' : '0.75s'}`;

            const angle = (i * 360 / numLights) * Math.PI / 180;
            const adjustedAngle = angle - Math.PI / 2;

            const x = 50 + radius * Math.cos(adjustedAngle);
            const y = 50 + radius * Math.sin(adjustedAngle);

            light.style.left = `${x}%`;
            light.style.top = `${y}%`;
            container.appendChild(light);
        }
    }, []);

    // --- ANIMATION LOOP ---
    useEffect(() => {
        let animationId: number;

        const animate = (ts: number) => {
            if (!state.current.s) state.current.s = ts;
            const progress = Math.min((ts - state.current.s) / 12000, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            state.current.r = state.current.b + (state.current.t - state.current.b) * ease;

            // Ticker Logic
            const currentDeg = (state.current.r * 180 / Math.PI) % 360;
            const sectorSize = 360 / (items.length || 1);
            const rawIdx = Math.floor(((270 - currentDeg + 360) % 360) / sectorSize);

            if (state.current.lastIdx !== -1 && rawIdx !== state.current.lastIdx) {
                if (pointerRef.current) {
                    pointerRef.current.classList.remove('tick');
                    void pointerRef.current.offsetWidth;
                    pointerRef.current.classList.add('tick');
                    if (navigator.vibrate) navigator.vibrate(5);
                }
            }
            state.current.lastIdx = rawIdx;

            draw();

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                state.current.r = state.current.t;
                draw();
                setIsSpinning(false);
                setShowModal(true);
            }
        };

        const idleAnimate = () => {
            if (state.current.x) return;
            state.current.r = (state.current.r + 0.002) % (Math.PI * 2);
            draw();
            animationId = requestAnimationFrame(idleAnimate);
        };

        if (state.current.x) {
            animationId = requestAnimationFrame(animate);
        } else {
            animationId = requestAnimationFrame(idleAnimate);
        }

        return () => cancelAnimationFrame(animationId);
    }, [isSpinning, items]);

    // --- BACKGROUND ANIMATION ---
    useEffect(() => {
        const canvas = bgCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0;
        let particles: any[] = [];
        const colors = ['rgba(0, 191, 165, 0.15)', 'rgba(255, 109, 0, 0.15)', 'rgba(255, 255, 255, 0.05)'];

        const resizeBg = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Bubble {
            x: number = 0;
            y: number = 0;
            size: number = 0;
            speed: number = 0;
            color: string = '';
            wobble: number = 0;
            wobbleSpeed: number = 0;
            amplitude: number = 0;

            constructor() {
                this.init();
            }
            init(bottom = false) {
                this.x = Math.random() * width;
                this.y = bottom ? height + Math.random() * 100 : Math.random() * height;
                this.size = Math.random() * 4 + 1;
                this.speed = Math.random() * 0.5 + 0.2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.wobble = Math.random() * Math.PI * 2;
                this.wobbleSpeed = Math.random() * 0.02 + 0.01;
                this.amplitude = Math.random() * 0.5;
            }
            update() {
                this.y -= this.speed;
                this.wobble += this.wobbleSpeed;
                this.x += Math.sin(this.wobble) * this.amplitude;
                if (this.y < -50) this.init(true);
            }
            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const initElements = () => {
            particles = [];
            const count = Math.floor((width * height) / 10000);
            for (let i = 0; i < count; i++) {
                particles.push(new Bubble());
            }
        };

        let animId: number;
        const animateBg = () => {
            ctx.clearRect(0, 0, width, height);

            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
            gradient.addColorStop(0, 'rgba(38, 50, 56, 0.2)');
            gradient.addColorStop(1, 'rgba(15, 16, 18, 0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animId = requestAnimationFrame(animateBg);
        };

        window.addEventListener('resize', () => {
            resizeBg();
            initElements();
        });

        resizeBg();
        initElements();
        animateBg();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resizeBg);
        };
    }, []);

    // --- HANDLERS ---
    const handleSpin = async () => {
        if (isSpinning || spinResult || showModal) return;

        const now = Date.now();
        // Simple debounce
        if (now - state.current.s < 400 && state.current.x) return;

        setIsSpinning(true);
        state.current.x = true;
        state.current.s = 0; // Reset animation start time

        try {
            const data = await spinRoulette();
            setSpinResult(data);

            // Generate Telegram link client-side
            // TODO: Get bot username from config
            const botUsername = '5lbBot'; // This should come from environment config
            const link = `https://t.me/${botUsername}?start=roulette_claimed`;
            setTelegramLink(link);
            savePrize(data.item, link);

            const step = (360 / items.length);
            // Calculate item index in the sorted list
            const itemIndex = items.findIndex(i => i.id === data.item.id);

            const target = (itemIndex + 0.5) * step;
            const PTR = 270;
            const desired = (PTR - target + 360) % 360;
            const desiredRad = desired * Math.PI / 180;
            const current = (state.current.r % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

            let diff = desiredRad - current;
            if (diff < 0) diff += Math.PI * 2;

            const laps = 8 + Math.floor(Math.random() * 3);
            state.current.b = state.current.r;
            state.current.t = state.current.r + laps * Math.PI * 2 + diff;

        } catch (error) {
            console.error('Spin failed', error);
            setIsSpinning(false);
            state.current.x = false;
        }
    };

    const handleClaim = () => {
        navigate('/profile');
    };

    const handleClose = () => {
        setShowModal(false);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0f1012] text-white">Загрузка...</div>;
    }

    return (
        <>
            <GlobalBackground />
            <style>{STYLES}</style>
            <div className="tilda-wheel-wrapper">

                <div className="tilda-wheel-container">
                    <div className="tilda-wheel-header">
                        <h1 className="tilda-wheel-title">Бонусная рулетка</h1>
                        <p className="tilda-wheel-subtitle">Испытайте удачу и получите дополнительные бонусы на свой счёт</p>
                    </div>

                    <div className="tilda-wheel-wrapper-inner">
                        <canvas id="tilda-wheelCanvas" ref={canvasRef}></canvas>

                        <div className="tilda-wheel-shadow"></div>

                        <div className="tilda-wheel-lights" ref={lightsRef}></div>

                        <div className="tilda-wheel-pointer" ref={pointerRef}></div>

                        <div className="tilda-wheel-center" onClick={handleSpin}>5lb</div>
                    </div>

                    <button
                        className="tilda-spin-button"
                        onClick={handleSpin}
                        disabled={isSpinning || !!spinResult}
                    >
                        <span className="tilda-spin-button-text">
                            {isSpinning ? 'Крутится...' : (spinResult ? 'Забрать бонусы' : 'Испытать удачу')}
                        </span>
                    </button>

                    <div className={`tilda-prize-modal ${showModal ? 'active' : ''}`}>
                        <div className="tilda-prize-modal-backdrop" onClick={handleClose}></div>
                        <div className="tilda-prize-modal-content">
                            <button className="tilda-close-modal" onClick={handleClose}>&times;</button>
                            <h2 className="tilda-prize-title">Отличный старт!</h2>
                            <p className="tilda-prize-text">
                                {spinResult ? `Вы выиграли ${spinResult.item.amount} бонусов! Они уже на вашем счёте.` : 'Вы выиграли!'}
                            </p>

                            <button className="tilda-claim-button" onClick={handleClaim}>
                                <span>Перейти в профиль</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
