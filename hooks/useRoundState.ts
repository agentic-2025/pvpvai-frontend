// import { useEffect, useState } from "react";
// import { PublicClient } from "viem";
// import { readContract, getAddress } from "wagmi/actions";
// import { roomAbi } from "@/lib/contract.types";
// import { wagmiConfig } from "@/components/wrapper/wrapper";

// // Provide local definition (or import from page if available)
// async function getRoundState(contractAddress: string, roundId: bigint) {
//   try {
//     const state = await readContract(wagmiConfig, {
//       abi: roomAbi,
//       address: getAddress(contractAddress),
//       functionName: "getRoundState",
//       args: [roundId],
//     });
//     return Number(state);
//   } catch (error) {
//     console.error("Error fetching round state:", error);
//     return null;
//   }
// }

// // hooks/useRoundState.ts
// interface UseRoundStateResult {
//     roundState: number | null;
//     isRoundOpen: boolean;
//     isTransitioning: boolean;
//   }
  
//   export function useRoundState(
//     contractAddress: string | null,
//     roundId: bigint | null,
//     publicClient: PublicClient | null
//   ): UseRoundStateResult {
//     const [roundState, setRoundState] = useState<number | null>(null);
//     const [isTransitioning, setIsTransitioning] = useState(false);
  
//     useEffect(() => {
//       if (!contractAddress || !roundId || !publicClient) return;
  
//       let mounted = true;
      
//       const fetchState = async () => {
//         try {
//           setIsTransitioning(true);
//           const state = await getRoundState(contractAddress, roundId);
//           if (mounted) {
//             setRoundState(state);
//             // Add small delay before allowing new transitions
//             setTimeout(() => setIsTransitioning(false), 500);
//           }
//         } catch (error) {
//           console.error("Error fetching round state:", error);
//           if (mounted) setIsTransitioning(false);
//         }
//       };
  
//       fetchState();
//       const interval = setInterval(fetchState, 5000);
  
//       return () => {
//         mounted = false;
//         clearInterval(interval);
//       };
//     }, [contractAddress, roundId, publicClient]);
  
//     return {
//       roundState,
//       isRoundOpen: roundState === 1,
//       isTransitioning
//     };
//   }