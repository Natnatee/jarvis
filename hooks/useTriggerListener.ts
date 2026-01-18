'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TriggerEvent {
  action: 'toggle' | 'start' | 'stop' | 'sendText' | 'connected';
  message?: string;
  timestamp?: number;
}

interface UseTriggerListenerOptions {
  onToggle: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onSendText?: (message: string) => void;
  enabled?: boolean;
}

export function useTriggerListener({
  onToggle,
  onStart,
  onStop,
  onSendText,
  enabled = true
}: UseTriggerListenerOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;
    
    // ปิด connection เดิมถ้ามี
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    console.log('🔌 Connecting to trigger service...');
    const eventSource = new EventSource('/api/trigger');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data: TriggerEvent = JSON.parse(event.data);
        console.log('📨 Trigger event received:', data);

        switch (data.action) {
          case 'connected':
            console.log('✅ Connected to trigger service');
            break;
          case 'toggle':
            onToggle();
            break;
          case 'start':
            onStart?.();
            break;
          case 'stop':
            onStop?.();
            break;
          case 'sendText':
            if (data.message) {
              onSendText?.(data.message);
            }
            break;
        }
      } catch (error) {
        console.error('❌ Error parsing trigger event:', error);
      }
    };

    eventSource.onerror = () => {
      console.warn('⚠️ Trigger connection lost. Reconnecting in 3s...');
      eventSource.close();
      
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, [enabled, onToggle, onStart, onStop, onSendText]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN
  };
}
