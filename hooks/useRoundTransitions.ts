import { useEffect, useRef, useState } from 'react';
import { readContract } from 'viem/actions';
import { getAddress } from 'viem';
import { wagmiConfig } from '@/components/wrapper/wrapper';
import { roomAbi } from '@/lib/contract.types';

// Add round state enum
export enum RoundState {
  UNKNOWN = 0,
  OPEN = 1,
  CLOSED = 2
}

// Interface defining the structure for tracking round transition state
interface RoundTransitionState {
  currentRoundId: bigint | null;    // Current round ID from the contract
  previousRoundId: bigint | null;   // Previous round ID for transition detection
  roundState: RoundState;           // Current round state
  previousState: RoundState;        // Previous round state
  hasTransitioned: boolean;         // Flag indicating if a transition occurred
  isInitialized: boolean;           // Flag to track initial state setup
}

/**
 * Custom hook to manage round transitions in the game
 * @param contractAddress - The address of the smart contract to monitor
 * @returns Object containing round transition state and control functions
 */
export const useRoundTransitions = (contractAddress: string | null) => {
  // Initialize state with default values
  const [state, setState] = useState<RoundTransitionState>(() => ({
    currentRoundId: null,
    previousRoundId: null,
    roundState: RoundState.UNKNOWN,
    previousState: RoundState.UNKNOWN,
    hasTransitioned: false,
    isInitialized: false,
  }));

  // Reference to store polling interval
  const pollingInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Fetches the current round data (ID and state) from the smart contract
   * @returns Promise resolving to the current round data or null if failed
   */
  const fetchCurrentRoundData = async () => {
    if (!contractAddress) return null;
    
    try {
      // Fetch round data in parallel for efficiency
      const [roundId, roundState] = await Promise.all([
        readContract(wagmiConfig, {
          abi: roomAbi,
          address: getAddress(contractAddress),
          functionName: "currentRoundId",
        }),
        readContract(wagmiConfig, {
          abi: roomAbi,
          address: getAddress(contractAddress),
          functionName: "getRoundState",
          args: [await readContract(wagmiConfig, {
            abi: roomAbi,
            address: getAddress(contractAddress),
            functionName: "currentRoundId",
          })],
        }),
      ]);

      // Debug round data fetching
      console.log('[Round Data]', {
        roundId: roundId.toString(),
        state: roundState,
        timestamp: new Date().toISOString()
      });

      return { roundId, roundState: Number(roundState) as RoundState };
    } catch (error) {
      console.error("[Round Data Error]:", error);
      return null;
    }
  };

  /**
   * Checks for round transitions by comparing current and previous round data
   * Updates state when a transition is detected
   */
  const checkForTransition = async () => {
    const currentData = await fetchCurrentRoundData();
    if (!currentData) return;

    setState(prev => {
      // Debug state changes
      const nextState = !prev.isInitialized ? {
        // Initial state setup
        currentRoundId: currentData.roundId,
        previousRoundId: currentData.roundId,
        roundState: currentData.roundState,
        previousState: currentData.roundState,
        hasTransitioned: false,
        isInitialized: true,
      } : (() => {
        // Detect state changes
        const hasRoundChanged = prev.currentRoundId !== null && 
                              currentData.roundId > prev.currentRoundId;
        const hasStateChanged = currentData.roundState !== prev.roundState;
        
        const hasTransitioned = hasRoundChanged || hasStateChanged;

        // Debug transition detection
        if (hasTransitioned) {
          console.log('[Round Transition]', {
            type: hasRoundChanged ? 'ROUND_CHANGE' : 'STATE_CHANGE',
            from: {
              roundId: prev.currentRoundId?.toString(),
              state: prev.roundState
            },
            to: {
              roundId: currentData.roundId.toString(),
              state: currentData.roundState
            },
            timestamp: new Date().toISOString()
          });
        }

        return {
          currentRoundId: currentData.roundId,
          previousRoundId: prev.currentRoundId,
          roundState: currentData.roundState,
          previousState: prev.roundState,
          hasTransitioned,
          isInitialized: true,
        };
      })();

      return nextState;
    });
  };

  // Set up polling effect to regularly check for transitions
  useEffect(() => {
    console.log('[Round Polling] Starting...', { contractAddress });
    checkForTransition();
    
    // Poll every 2 seconds for faster response
    pollingInterval.current = setInterval(checkForTransition, 2000);

    return () => {
      console.log('[Round Polling] Cleanup');
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [contractAddress]); // Re-run effect if contract address changes

  /**
   * Function to reset transition flag after handling transition
   * Should be called after transition-related actions are completed
   */
  const acknowledgeTransition = () => {
    setState(prev => ({
      ...prev,
      hasTransitioned: false
    }));
  };

  /**
   * Function to check if a given round is active
   * @param roundId - The ID of the round to check
   * @returns Boolean indicating if the round is active
   */
  const isRoundActive = (roundId: bigint | null): boolean => {
    const isActive = state.roundState === RoundState.OPEN && 
                    state.currentRoundId === roundId;
    
    // Debug round active state
    console.log('[Round Active Check]', {
      checked: roundId?.toString(),
      current: state.currentRoundId?.toString(),
      state: state.roundState,
      isActive
    });
    
    return isActive;
  };

  // Return current state and control functions
  return {
    currentRoundId: state.currentRoundId,
    previousRoundId: state.previousRoundId,
    roundState: state.roundState,
    previousState: state.previousState,
    hasTransitioned: state.hasTransitioned,
    isInitialized: state.isInitialized,
    isRoundActive,
    acknowledgeTransition
  };
};
