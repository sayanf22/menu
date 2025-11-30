/**
 * Bell Sound Utility
 * Plays notification sound for restaurant bell alerts
 */

// Bell sound using Web Audio API (no external files needed)
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a bell/chime sound
 * Duration: ~15 seconds with repeating pattern
 */
export function playBellSound(duration: number = 15000): () => void {
  const ctx = getAudioContext();
  const startTime = ctx.currentTime;
  const endTime = startTime + duration / 1000;
  
  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  
  // Bell frequencies (pleasant chime)
  const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  function playChime(time: number) {
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3 - i * 0.05, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time + i * 0.05);
      osc.stop(time + 1.5);
      
      oscillators.push(osc);
      gains.push(gain);
    });
  }
  
  // Play chime every 3 seconds for duration
  let currentTime = startTime;
  while (currentTime < endTime) {
    playChime(currentTime);
    currentTime += 3;
  }
  
  // Return stop function
  return () => {
    oscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { /* already stopped */ }
    });
    gains.forEach(gain => {
      gain.gain.setValueAtTime(0, ctx.currentTime);
    });
  };
}

/**
 * Play a single notification ding
 */
export function playNotificationDing(): void {
  const ctx = getAudioContext();
  const time = ctx.currentTime;
  
  // Two-tone ding
  [880, 1108.73].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0, time + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.4, time + i * 0.1 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + i * 0.1 + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time + i * 0.1);
    osc.stop(time + i * 0.1 + 0.5);
  });
}

/**
 * Request audio permission (needed for autoplay)
 */
export async function requestAudioPermission(): Promise<boolean> {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return true;
  } catch (e) {
    console.error('Audio permission denied:', e);
    return false;
  }
}