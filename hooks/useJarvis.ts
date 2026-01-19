'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { base64ToFloat32, floatToBase64PCM } from '@/lib/audioConverter';
import instructions from '@/lib/instructions.json';
import { say_hello } from '@/app/actions/say_hello';

const SAMPLE_RATE = 24000;

// Tool handlers - เพิ่ม function ใหม่ได้ที่นี่
const toolHandlers: Record<string, () => Promise<any>> = {
  say_hello: say_hello,
};

export type JarvisStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export function useJarvis() {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<JarvisStatus>('idle');
  const refs = useRef<any>({});
  const speakTimeout = useRef<NodeJS.Timeout | null>(null);

  // ค่า timeout (ms) ที่จะรอหลังจาก chunk สุดท้าย ถ้าไม่มี chunk ใหม่มา → ถือว่าจบการพูด
  const SPEAKING_TIMEOUT_MS = 4000; // ปรับได้ 2200–3500 ตามความเหมาะสม

  // Auto-close if listening for too long
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (status === 'listening' && active) {
      timeout = setTimeout(() => {
        console.log('💤 Auto closing due to inactivity...');
        if (refs.current.session) {
          refs.current.stream?.getTracks().forEach((t: any) => t.stop());
          refs.current.audioCtx?.close();
          refs.current.session?.close();
          setActive(false);
          setStatus('idle');
        }
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [status, active]);

  // ส่งข้อความแทนการพูด
  const sendText = useCallback((message: string) => {
    if (!refs.current.session) {
      console.warn('⚠️ Session not active');
      return;
    }
    setStatus('thinking');
    refs.current.session.sendClientContent({
      turns: [{ role: 'user', parts: [{ text: message }] }]
    });
    console.log('📝 Text sent:', message);
  }, []);

  const toggle = useCallback(async () => {
    if (active) {
      refs.current.stream?.getTracks().forEach((t: any) => t.stop());
      refs.current.audioCtx?.close();
      refs.current.session?.close();
      setActive(false);
      setStatus('idle');
      if (speakTimeout.current) clearTimeout(speakTimeout.current);
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
          systemInstruction: { parts: [{ text: instructions.instructions }] },
          responseModalities: [Modality.AUDIO],
          tools: instructions.tools as any,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
        },
        callbacks: {
          onmessage: async (msg) => {
            // Handle Tool Calls
            const toolCall = msg.toolCall;
            if (toolCall?.functionCalls) {
              setStatus('thinking');
              for (const fc of toolCall.functionCalls) {
                console.log(`🔧 Tool called: ${fc.name}`, fc.args);

                if (!fc.name || !fc.id) continue;

                if (fc.name === 'close_session') {
                  console.log('👋 Closing session via tool call');
                  session.sendToolResponse({
                    functionResponses: [{ id: fc.id, name: fc.name, response: { success: true } }]
                  });
                  stream.getTracks().forEach((t: any) => t.stop());
                  audioCtx.close();
                  session.close();
                  setActive(false);
                  setStatus('idle');
                  return;
                }

                const handler = toolHandlers[fc.name];
                if (handler) {
                  try {
                    const result = await handler();
                    console.log(`✅ Tool result:`, result);
                    session.sendToolResponse({
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: result
                      }]
                    });
                  } catch (error) {
                    console.error(`❌ Tool error:`, error);
                    session.sendToolResponse({
                      functionResponses: [{
                        id: fc.id,
                        name: fc.name,
                        response: { error: String(error) }
                      }]
                    });
                  }
                } else {
                  console.warn(`⚠️ Unknown tool: ${fc.name}`);
                }
              }
              return;
            }

            // ────────────────────────────────────────────────
            // Handle audio response (ส่วนที่แก้ไขหลัก)
            // ────────────────────────────────────────────────
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const float32 = base64ToFloat32(audioData);
              const buffer = audioCtx.createBuffer(1, float32.length, SAMPLE_RATE);
              buffer.copyToChannel(float32 as any, 0);

              const source = audioCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtx.destination);

              const playTime = Math.max(audioCtx.currentTime, nextStartTime);
              source.start(playTime);
              nextStartTime = playTime + buffer.duration;

              // ตั้ง / reset timeout ทุกครั้งที่มี chunk ใหม่
              setStatus('speaking');

              if (speakTimeout.current) {
                clearTimeout(speakTimeout.current);
              }

              speakTimeout.current = setTimeout(() => {
                setStatus('listening');
                console.log('🗣️ No more audio chunks → back to listening');
              }, SPEAKING_TIMEOUT_MS);
            }
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
      setStatus('listening');
    } catch (error) {
      console.error('Failed to start Jarvis:', error);
      setActive(false);
      setStatus('idle');
    }
  }, [active]);

  return { active, toggle, sendText, status };
}