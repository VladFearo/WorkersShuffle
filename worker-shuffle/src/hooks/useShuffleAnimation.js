import { useState, useCallback } from 'react';

export const useShuffleAnimation = () => {
  const [isShuffling, setIsShuffling] = useState(false);

  const animatedShuffle = useCallback(async (shuffleFunction) => {
    setIsShuffling(true);
    
    // Force a synchronous DOM update before starting animation
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Execute shuffle immediately while animation is showing
    shuffleFunction();
    
    // Keep animation running for the full duration
    setTimeout(() => {
      setIsShuffling(false);
    }, 400); // Match CSS animation duration exactly
  }, []);

  return { isShuffling, animatedShuffle };
};