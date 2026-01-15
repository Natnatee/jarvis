'use client';

import { useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { base64ToFloat32, floatToBase64PCM } from '@/lib/audioConverter';

const SAMPLE_RATE = 24000;

export function useJarvis() {
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const refs = useRef<any>({});

  const toggle = useCallback(async () => {
    if (active) {
      refs.current.stream?.getTracks().forEach((t: any) => t.stop());
      refs.current.audioCtx?.close();
      refs.current.session?.close();
      setActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

      let nextStartTime = 0;

      const session = await genAI.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
        },
        callbacks: {
          onmessage: (msg) => {
            const text = msg.serverContent?.modelTurn?.parts?.find(p => p.text)?.text;
            if (text) {
              setTranscript(prev => prev + text); // นำข้อความมาต่อกันเพื่อแสดงผล
            }
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (!audioData) return;

            const float32 = base64ToFloat32(audioData);
            const buffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
            buffer.copyToChannel(float32 as any, 0);

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);

            const playTime = Math.max(audioCtx.currentTime, nextStartTime);
            source.start(playTime);
            nextStartTime = playTime + buffer.duration;
          }
        }
      });

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        session.sendRealtimeInput({
          media: {
            data: floatToBase64PCM(inputData),
            mimeType: `audio/pcm;rate=${SAMPLE_RATE}`
          }
        });
      };

      audioCtx.createMediaStreamSource(stream).connect(processor);
      processor.connect(audioCtx.destination);

      refs.current = { stream, audioCtx, session };
      setActive(true);
    } catch (error) {
      console.error('Failed to start Jarvis:', error);
      setActive(false);
    }
  }, [active]);

  return { active, toggle, transcript };
}
