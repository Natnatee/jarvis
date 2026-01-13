'use client';
import { useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

export default function page() {
  const [active, setActive] = useState(false);
  const r = useRef<any>({});

  const start = async () => {
    if (active) {
      r.current.s?.getTracks().forEach((t: any) => t.stop());
      r.current.c?.close();
      r.current.j?.close();
      return setActive(false);
    }
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    const c = new AudioContext({ sampleRate: 16000 });
    const g = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    let next = 0;
    const j = await g.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: { responseModalities: [Modality.AUDIO] },
      callbacks: {
        onmessage: (m) => {
          const d = m.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (!d) return;
          const b = Uint8Array.from(atob(d), c => c.charCodeAt(0));
          const i = new Int16Array(b.buffer);
          const f = new Float32Array(i.length);
          for (let k = 0; k < i.length; k++) f[k] = i[k] / 32768;
          const buf = c.createBuffer(1, f.length, 16000);
          buf.copyToChannel(f, 0);
          const src = c.createBufferSource();
          src.buffer = buf;
          src.connect(c.destination);
          const time = Math.max(c.currentTime, next);
          src.start(time);
          next = time + buf.duration;
        }
      }
    });
    const p = c.createScriptProcessor(4096, 1, 1);
    p.onaudioprocess = (e) => {
      const inp = e.inputBuffer.getChannelData(0);
      const out = new Int16Array(inp.length);
      for (let k = 0; k < inp.length; k++) out[k] = Math.max(-1, Math.min(1, inp[k])) * 0x7fff;
      j.sendRealtimeInput({ media: { data: btoa(String.fromCharCode(...new Uint8Array(out.buffer))), mimeType: 'audio/pcm;rate=16000' } });
    };
    c.createMediaStreamSource(s).connect(p);
    p.connect(c.destination);
    r.current = { s, c, j };
    setActive(true);
  };

  return (
    <div style={{ background: '#000', color: '#fff', height: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' }}>
      <button onClick={start} style={{ 
        width: 200, height: 200, borderRadius: '50%', border: 'none', 
        background: active ? '#f44' : '#44f', color: '#fff', fontSize: 24, cursor: 'pointer',
        boxShadow: active ? '0 0 50px #f44' : '0 0 20px #44f', transition: '0.3s'
      }}>
        {active ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

