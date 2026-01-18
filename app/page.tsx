'use client';

import { useJarvis } from '@/hooks/useJarvis';
import { useTriggerListener } from '@/hooks/useTriggerListener';

export default function Page() {
  const { active, toggle, sendText, status } = useJarvis();

  // Subscribe to external triggers
  useTriggerListener({
    onToggle: toggle,
    onSendText: sendText,
    enabled: true,
  });

  const statusLabel = {
    idle: 'STANDBY',
    listening: 'LISTENING',
    thinking: 'ANALYZING',
    speaking: 'SPEAKING',
  }[status];

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Frame จำลองมือถือ (ถ้ารันบนจอคอม) */}
      <div className="relative w-full h-full md:w-[450px] md:h-[800px] border-0 md:border-2 md:border-stone-900 rounded-none md:rounded-3xl bg-black flex flex-col items-center justify-center shadow-2xl overflow-hidden">
        {/* Visualizer Area */}
        <div className="flex-1 flex items-center justify-center w-full relative">
          {/* Background Glow (Orange) */}
          {active && (
            <div
              className={[
                'absolute inset-0 pointer-events-none blur-[110px]',
                status === 'speaking'
                  ? 'bg-orange-500/12 animate-pulse'
                  : status === 'thinking'
                  ? 'bg-orange-500/10'
                  : 'bg-orange-900/10 animate-pulse',
              ].join(' ')}
            />
          )}

          {/* Scanline Overlay */}
          <div className="scanlines mix-blend-overlay opacity-20" />

          {/* STATUS TEXT (OFFLINE ONLY) */}
          {!active && (
            <div className="text-orange-900/50 text-xs font-mono tracking-[0.2em] z-20 animate-pulse">
              SYSTEM OFFLINE
            </div>
          )}

          {/* FUTURISTIC CORE */}
          {active && (
            <div className="relative w-[360px] h-[360px] flex items-center justify-center">
              {/* Outer aura */}
              <div
                className={[
                  'absolute inset-0 rounded-full blur-2xl opacity-70',
                  status === 'speaking'
                    ? 'animate-jarvisA'
                    : status === 'thinking'
                    ? 'animate-jarvisB'
                    : status === 'listening'
                    ? 'animate-jarvisC'
                    : 'animate-jarvisD',
                ].join(' ')}
              />

              {/* Orbiting particles */}
              <div className="absolute inset-0 pointer-events-none">
                <div className={`orb orb-1 ${status}`} />
                <div className={`orb orb-2 ${status}`} />
                <div className={`orb orb-3 ${status}`} />
              </div>

              {/* Rotating rings */}
              <div className="absolute inset-0 rounded-full ring ring-a" />
              <div className="absolute inset-[16px] rounded-full ring ring-b" />
              <div className="absolute inset-[38px] rounded-full ring ring-c" />

              {/* HUD ticks */}
              <div className="absolute inset-[10px] rounded-full hud-ticks" />
              <div className="absolute inset-[54px] rounded-full hud-ticks hud-ticks-soft" />

              {/* Core lens */}
              <div className="absolute inset-[84px] rounded-full core-lens">
                <div className="absolute inset-0 rounded-full core-shine" />
                <div
                  className={[
                    'absolute inset-[10px] rounded-full core-inner',
                    status === 'speaking'
                      ? 'core-speaking'
                      : status === 'thinking'
                      ? 'core-thinking'
                      : status === 'listening'
                      ? 'core-listening'
                      : 'core-idle',
                  ].join(' ')}
                />
                {/* waveform bars */}
                <div className={`absolute inset-0 flex items-center justify-center gap-[6px] waveform ${status}`}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`bar bar-${i + 1}`} />
                  ))}
                </div>
              </div>

              {/* Crosshair + subtle lines */}
              <div className="absolute w-[120%] h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent top-1/2 -translate-y-1/2" />
              <div className="absolute h-[120%] w-[1px] bg-gradient-to-b from-transparent via-orange-500/20 to-transparent left-1/2 -translate-x-1/2" />

              {/* Status chip */}
              <div className="absolute -bottom-3 px-3 py-1 rounded-full border border-orange-500/15 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${status}`} />
                  <span className="text-[10px] text-orange-200/60 font-mono tracking-[0.22em]">
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Button (Bottom Right) */}
        <button
          onClick={toggle}
          className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-stone-900/40 hover:bg-stone-800/80 active:bg-stone-700 backdrop-blur-sm transition-all cursor-pointer flex items-center justify-center group border border-white/5"
          aria-label="Toggle Jarvis"
        >
          <div
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              active ? 'bg-orange-500 shadow-[0_0_8px_orange]' : 'bg-red-900/50'
            }`}
          />
        </button>

        {/* Debug State text (จางๆ มุมซ้าย) */}
        <div className="absolute bottom-4 left-4 text-[10px] text-white/5 font-mono pointer-events-none">
          {status.toUpperCase()}
        </div>

        {/* Component-scoped styles */}
        <style jsx>{`
          /* scanlines (keep your existing look) */
          .scanlines {
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: repeating-linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.06) 1px,
              rgba(0, 0, 0, 0) 3px,
              rgba(0, 0, 0, 0) 6px
            );
          }

          /* ======= AURA ANIMS ======= */
          @keyframes jarvisA {
            0% {
              transform: scale(0.96) rotate(0deg);
              filter: blur(34px);
              opacity: 0.65;
            }
            50% {
              transform: scale(1.04) rotate(180deg);
              filter: blur(44px);
              opacity: 0.95;
            }
            100% {
              transform: scale(0.96) rotate(360deg);
              filter: blur(34px);
              opacity: 0.65;
            }
          }
          @keyframes jarvisB {
            0% {
              transform: scale(0.98) rotate(0deg);
              opacity: 0.55;
            }
            50% {
              transform: scale(1.02) rotate(180deg);
              opacity: 0.8;
            }
            100% {
              transform: scale(0.98) rotate(360deg);
              opacity: 0.55;
            }
          }
          @keyframes jarvisC {
            0% {
              transform: scale(1) rotate(0deg);
              opacity: 0.45;
            }
            50% {
              transform: scale(1.015) rotate(180deg);
              opacity: 0.62;
            }
            100% {
              transform: scale(1) rotate(360deg);
              opacity: 0.45;
            }
          }
          @keyframes jarvisD {
            0% {
              transform: scale(0.995);
              opacity: 0.35;
            }
            50% {
              transform: scale(1.005);
              opacity: 0.45;
            }
            100% {
              transform: scale(0.995);
              opacity: 0.35;
            }
          }
          .animate-jarvisA {
            background: radial-gradient(
                circle at 30% 30%,
                rgba(255, 140, 0, 0.28),
                rgba(255, 90, 0, 0.08) 45%,
                rgba(0, 0, 0, 0) 70%
              ),
              radial-gradient(
                circle at 70% 65%,
                rgba(255, 200, 120, 0.16),
                rgba(0, 0, 0, 0) 60%
              );
            animation: jarvisA 2.2s linear infinite;
          }
          .animate-jarvisB {
            background: radial-gradient(
                circle at 35% 35%,
                rgba(255, 160, 60, 0.22),
                rgba(0, 0, 0, 0) 65%
              ),
              radial-gradient(
                circle at 70% 60%,
                rgba(255, 110, 0, 0.1),
                rgba(0, 0, 0, 0) 62%
              );
            animation: jarvisB 2.8s linear infinite;
          }
          .animate-jarvisC {
            background: radial-gradient(
                circle at 40% 40%,
                rgba(255, 170, 80, 0.18),
                rgba(0, 0, 0, 0) 64%
              ),
              radial-gradient(
                circle at 70% 65%,
                rgba(255, 120, 0, 0.08),
                rgba(0, 0, 0, 0) 62%
              );
            animation: jarvisC 3.6s linear infinite;
          }
          .animate-jarvisD {
            background: radial-gradient(
              circle at 50% 50%,
              rgba(255, 130, 20, 0.14),
              rgba(0, 0, 0, 0) 65%
            );
            animation: jarvisD 3.8s ease-in-out infinite;
          }

          /* ======= RINGS ======= */
          .ring {
            border: 1px solid rgba(255, 140, 0, 0.18);
            box-shadow: inset 0 0 22px rgba(255, 140, 0, 0.08);
            mask-image: radial-gradient(circle, black 66%, transparent 67%);
          }

          @keyframes spinSlow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes spinReverse {
            from {
              transform: rotate(360deg);
            }
            to {
              transform: rotate(0deg);
            }
          }
          .ring-a {
            animation: spinSlow 7s linear infinite;
            border-color: rgba(255, 170, 60, 0.18);
          }
          .ring-b {
            animation: spinReverse 5.2s linear infinite;
            border-color: rgba(255, 120, 0, 0.16);
          }
          .ring-c {
            animation: spinSlow 3.8s linear infinite;
            border-color: rgba(255, 210, 120, 0.12);
          }

          /* ======= HUD TICKS ======= */
          .hud-ticks {
            border: 1px solid rgba(255, 140, 0, 0.12);
            box-shadow: inset 0 0 18px rgba(255, 140, 0, 0.05);
            background: conic-gradient(
              from 0deg,
              rgba(255, 140, 0, 0.22),
              rgba(0, 0, 0, 0) 8%,
              rgba(255, 140, 0, 0.14) 10%,
              rgba(0, 0, 0, 0) 18%,
              rgba(255, 140, 0, 0.22) 20%,
              rgba(0, 0, 0, 0) 28%,
              rgba(255, 140, 0, 0.14) 30%,
              rgba(0, 0, 0, 0) 38%,
              rgba(255, 140, 0, 0.22) 40%,
              rgba(0, 0, 0, 0) 48%,
              rgba(255, 140, 0, 0.14) 50%,
              rgba(0, 0, 0, 0) 58%,
              rgba(255, 140, 0, 0.22) 60%,
              rgba(0, 0, 0, 0) 68%,
              rgba(255, 140, 0, 0.14) 70%,
              rgba(0, 0, 0, 0) 78%,
              rgba(255, 140, 0, 0.22) 80%,
              rgba(0, 0, 0, 0) 88%,
              rgba(255, 140, 0, 0.14) 90%,
              rgba(0, 0, 0, 0) 98%
            );
            opacity: 0.55;
          }
          .hud-ticks-soft {
            opacity: 0.25;
            filter: blur(0.2px);
          }

          /* ======= CORE ======= */
          .core-lens {
            border: 1px solid rgba(255, 140, 0, 0.14);
            background: radial-gradient(
              circle at 50% 40%,
              rgba(255, 170, 80, 0.09),
              rgba(0, 0, 0, 0) 65%
            );
            box-shadow: inset 0 0 30px rgba(255, 140, 0, 0.06);
            overflow: hidden;
          }
          .core-shine {
            background: radial-gradient(
              circle at 35% 30%,
              rgba(255, 220, 160, 0.14),
              rgba(0, 0, 0, 0) 48%
            );
            filter: blur(0.2px);
          }
          .core-inner {
            background: radial-gradient(
              circle at 50% 50%,
              rgba(255, 140, 0, 0.24),
              rgba(0, 0, 0, 0) 65%
            );
            filter: saturate(1.2);
            transition: transform 250ms ease, opacity 250ms ease;
          }

          @keyframes corePulse {
            0% {
              transform: scale(1);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0.7;
            }
          }
          @keyframes coreScan {
            0% {
              transform: scale(1) rotate(0deg);
              opacity: 0.7;
            }
            50% {
              transform: scale(1.03) rotate(180deg);
              opacity: 0.95;
            }
            100% {
              transform: scale(1) rotate(360deg);
              opacity: 0.7;
            }
          }
          @keyframes coreTalk {
            0% {
              transform: scale(1) rotate(0deg);
              opacity: 0.85;
            }
            50% {
              transform: scale(1.07) rotate(180deg);
              opacity: 1;
            }
            100% {
              transform: scale(1) rotate(360deg);
              opacity: 0.85;
            }
          }

          .core-idle {
            opacity: 0.55;
          }
          .core-listening {
            opacity: 0.75;
            animation: corePulse 2.2s ease-in-out infinite;
          }
          .core-thinking {
            opacity: 0.9;
            animation: coreScan 1.6s linear infinite;
          }
          .core-speaking {
            opacity: 1;
            animation: coreTalk 1.1s linear infinite;
          }

          /* ======= STATUS DOT ======= */
          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 999px;
            box-shadow: 0 0 12px rgba(255, 140, 0, 0.2);
            background: rgba(255, 120, 0, 0.45);
            transition: opacity 200ms ease, transform 200ms ease;
          }
          .status-dot.speaking {
            background: rgba(255, 140, 0, 0.95);
            box-shadow: 0 0 18px rgba(255, 140, 0, 0.55);
            transform: scale(1.1);
          }
          .status-dot.thinking {
            background: rgba(255, 140, 0, 0.75);
            box-shadow: 0 0 16px rgba(255, 140, 0, 0.35);
          }
          .status-dot.listening {
            background: rgba(255, 140, 0, 0.55);
            box-shadow: 0 0 14px rgba(255, 140, 0, 0.25);
          }
          .status-dot.idle {
            opacity: 0.35;
          }

          /* ======= ORBS ======= */
          .orb {
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: rgba(255, 140, 0, 0.65);
            box-shadow: 0 0 18px rgba(255, 140, 0, 0.4);
            filter: blur(0.2px);
          }
          @keyframes orbit1 {
            from {
              transform: rotate(0deg) translateX(175px) rotate(0deg);
              opacity: 0.35;
            }
            50% {
              opacity: 0.95;
            }
            to {
              transform: rotate(360deg) translateX(175px) rotate(-360deg);
              opacity: 0.35;
            }
          }
          @keyframes orbit2 {
            from {
              transform: rotate(0deg) translateX(150px) rotate(0deg);
              opacity: 0.25;
            }
            50% {
              opacity: 0.75;
            }
            to {
              transform: rotate(-360deg) translateX(150px) rotate(360deg);
              opacity: 0.25;
            }
          }
          @keyframes orbit3 {
            from {
              transform: rotate(0deg) translateX(125px) rotate(0deg);
              opacity: 0.2;
            }
            50% {
              opacity: 0.6;
            }
            to {
              transform: rotate(360deg) translateX(125px) rotate(-360deg);
              opacity: 0.2;
            }
          }
          .orb-1 {
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            animation: orbit1 4.2s linear infinite;
          }
          .orb-2 {
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            animation: orbit2 5.6s linear infinite;
          }
          .orb-3 {
            left: 50%;
            top: 50%;
            transform-origin: 0 0;
            animation: orbit3 7.2s linear infinite;
          }

          /* speed up orbs when speaking */
          .orb-1.speaking {
            animation-duration: 2.2s;
          }
          .orb-2.speaking {
            animation-duration: 2.8s;
          }
          .orb-3.speaking {
            animation-duration: 3.4s;
          }
          .orb-1.thinking,
          .orb-2.thinking,
          .orb-3.thinking {
            opacity: 0.6;
          }

          /* ======= WAVEFORM ======= */
          .waveform {
            pointer-events: none;
            opacity: 0.9;
            mix-blend-mode: screen;
            transform: translateZ(0);
          }
          .waveform .bar {
            width: 4px;
            height: 18px;
            border-radius: 999px;
            background: rgba(255, 140, 0, 0.55);
            box-shadow: 0 0 14px rgba(255, 140, 0, 0.22);
            transform-origin: center;
          }

          @keyframes bar {
            0% {
              transform: scaleY(0.35);
              opacity: 0.55;
            }
            50% {
              transform: scaleY(1.25);
              opacity: 1;
            }
            100% {
              transform: scaleY(0.35);
              opacity: 0.55;
            }
          }

          /* default (idle/listening) */
          .waveform.idle .bar,
          .waveform.listening .bar {
            animation: bar 1.8s ease-in-out infinite;
            opacity: 0.55;
            filter: blur(0.1px);
          }

          /* thinking = tighter, smoother */
          .waveform.thinking .bar {
            animation: bar 1.25s ease-in-out infinite;
            opacity: 0.75;
          }

          /* speaking = punchy */
          .waveform.speaking .bar {
            animation: bar 0.78s ease-in-out infinite;
            opacity: 1;
          }

          /* stagger */
          .bar-1 {
            animation-delay: -0.1s;
          }
          .bar-2 {
            animation-delay: -0.22s;
          }
          .bar-3 {
            animation-delay: -0.34s;
          }
          .bar-4 {
            animation-delay: -0.46s;
          }
          .bar-5 {
            animation-delay: -0.58s;
          }
          .bar-6 {
            animation-delay: -0.46s;
          }
          .bar-7 {
            animation-delay: -0.34s;
          }
          .bar-8 {
            animation-delay: -0.22s;
          }
          .bar-9 {
            animation-delay: -0.1s;
          }
        `}</style>
      </div>
    </div>
  );
}
