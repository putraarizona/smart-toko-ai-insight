
import { useCallback } from 'react';

export const useAudioFeedback = () => {
  const playSuccessSound = useCallback(() => {
    try {
      // Create audio context for success sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create success sound (positive chime)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Success sound: C5 -> E5 -> G5 (major chord progression)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, 500);
    } catch (error) {
      console.warn('Could not play success sound:', error);
    }
  }, []);

  const playErrorSound = useCallback(() => {
    try {
      // Create audio context for error sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create error sound (descending tone)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Error sound: F4 -> D4 -> Bb3 (descending minor progression)
      oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
      oscillator.frequency.setValueAtTime(293.66, audioContext.currentTime + 0.15); // D4
      oscillator.frequency.setValueAtTime(233.08, audioContext.currentTime + 0.3); // Bb3
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.type = 'square';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, 600);
    } catch (error) {
      console.warn('Could not play error sound:', error);
    }
  }, []);

  return {
    playSuccessSound,
    playErrorSound
  };
};
