'use client';

import { useJarvis } from '@/hooks/useJarvis';
import { useTriggerListener } from '@/hooks/useTriggerListener';

export default function Page() {
  const { active, toggle, sendText, status } = useJarvis();

  // Subscribe to external triggers
  useTriggerListener({
    onToggle: toggle,
    onSendText: sendText,
    enabled: true
  });

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
        {/* Frame จำลองมือถือ (ถ้ารันบนจอคอม) */}
        <div className="relative w-full h-full md:w-[450px] md:h-[800px] border-0 md:border-2 md:border-stone-900 rounded-none md:rounded-3xl bg-black flex flex-col items-center justify-center shadow-2xl overflow-hidden">
            
            {/* Visualizer Area */}
            <div className="flex-1 flex items-center justify-center w-full relative">
                
                {/* Background Glow */}
                {active && (
                    <div className="absolute inset-0 bg-cyan-900/5 blur-[100px] animate-pulse" />
                )}

                {status === 'idle' && (
                    <div className="text-stone-800 text-xs font-mono tracking-[0.2em] opacity-50">SYSTEM OFFLINE</div>
                )}

                {status === 'listening' && (
                    <div className="status-indicator listening shadow-[0_0_50px_cyan]" />
                )}

                {status === 'thinking' && (
                    <div className="status-indicator thinking" />
                )}

                {status === 'speaking' && (
                    <div className="speaking-container">
                        <div className="bar" />
                        <div className="bar" />
                        <div className="bar" />
                        <div className="bar" />
                        <div className="bar" />
                        <div className="bar" />
                    </div>
                )}
            </div>

            {/* Hidden Button (Bottom Right) */}
            <button 
                onClick={toggle}
                className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-stone-900/40 hover:bg-stone-800/80 active:bg-stone-700 backdrop-blur-sm transition-all cursor-pointer flex items-center justify-center group border border-white/5"
                aria-label="Toggle Jarvis"
            >
                {/* Status Dot */}
                <div className={`w-2 h-2 rounded-full transition-all duration-500 ${active ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-red-900/50'}`} />
            </button>
            
            {/* Debug State text (จางๆ มุมซ้าย) */}
            <div className="absolute bottom-4 left-4 text-[10px] text-white/5 font-mono pointer-events-none">
                {status.toUpperCase()}
            </div>
        </div>
    </div>
  );
}
