import { useState, useEffect } from 'react';

// Hook to manage the enabled/disabled state of game controls
export const useControlState = (
  isRoundOpen: boolean, 
  selectedRoundId: bigint | null, 
  currentContractRound: bigint | null
) => {
  const [isControlsEnabled, setIsControlsEnabled] = useState(false);

  useEffect(() => {
    // Controls are enabled when round is open and we're on current round
    const shouldEnableControls = 
      isRoundOpen && 
      selectedRoundId !== null && 
      currentContractRound !== null &&
      selectedRoundId === currentContractRound; // Must match exactly
    
    // Debug control state
    console.log('[Controls State]', {
      isRoundOpen,
      selected: selectedRoundId?.toString(),
      current: currentContractRound?.toString(),
      enabled: shouldEnableControls,
      timestamp: new Date().toISOString()
    });
    
    setIsControlsEnabled(shouldEnableControls);
  }, [isRoundOpen, selectedRoundId, currentContractRound]);

  return isControlsEnabled;
};
