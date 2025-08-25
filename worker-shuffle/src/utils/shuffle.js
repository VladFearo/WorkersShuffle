// Fisher-Yates shuffle algorithm
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Smart shuffle that preserves held workers in their positions
export const smartShuffle = (currentOrder = [], allWorkers = []) => {
  // If no current order exists, create initial order from all workers
  if (currentOrder.length === 0) {
    // If no workers are held on first shuffle, just shuffle everything
    const heldWorkers = allWorkers.filter(w => w.isHeld);
    if (heldWorkers.length === 0) {
      return shuffleArray(allWorkers);
    }
    
    // If all workers are held, return original order
    if (heldWorkers.length === allWorkers.length) {
      return [...allWorkers];
    }
    
    // Some workers are held - they should stay in their current positions
    const result = new Array(allWorkers.length);
    const unheldWorkers = allWorkers.filter(w => !w.isHeld);
    const shuffledUnheld = shuffleArray(unheldWorkers);
    
    let unheldIndex = 0;
    for (let i = 0; i < allWorkers.length; i++) {
      if (allWorkers[i].isHeld) {
        // Keep held worker in their original position
        result[i] = allWorkers[i];
      } else {
        // Place shuffled unheld worker
        result[i] = shuffledUnheld[unheldIndex];
        unheldIndex++;
      }
    }
    
    return result;
  }

  // Create a copy of current order
  const newOrder = [...currentOrder];
  
  // Get positions of held workers
  const heldPositions = new Map();
  const unheldWorkers = [];
  
  currentOrder.forEach((worker, index) => {
    if (worker.isHeld) {
      heldPositions.set(index, worker);
    } else {
      unheldWorkers.push(worker);
    }
  });
  
  // If no workers are held, just shuffle everything
  if (heldPositions.size === 0) {
    return shuffleArray(currentOrder);
  }
  
  // If all workers are held, return current order
  if (heldPositions.size === currentOrder.length) {
    return currentOrder;
  }
  
  // Shuffle only the unheld workers
  const shuffledUnheld = shuffleArray(unheldWorkers);
  
  // Fill the new order
  let unheldIndex = 0;
  for (let i = 0; i < newOrder.length; i++) {
    if (heldPositions.has(i)) {
      // Keep held worker in place
      newOrder[i] = heldPositions.get(i);
    } else {
      // Place shuffled unheld worker
      newOrder[i] = shuffledUnheld[unheldIndex];
      unheldIndex++;
    }
  }
  
  return newOrder;
};