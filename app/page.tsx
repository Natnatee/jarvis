'use client';

import { useJarvis } from '@/hooks/useJarvis';
import { useTriggerListener } from '@/hooks/useTriggerListener';
import { StartButton } from '@/components/StartButton';

export default function Page() {
  const { active, toggle, sendText } = useJarvis();

  // Subscribe to external triggers
  useTriggerListener({
    onToggle: toggle,
    onSendText: sendText,
    enabled: true
  });

  return (
    <div style={{ 
      background: '#000', 
      color: '#fff', 
      height: '100vh', 
      display: 'grid', 
      placeItems: 'center', 
      fontFamily: 'sans-serif' 
    }}>
      <StartButton active={active} onClick={toggle} />
    </div>
  );
}
