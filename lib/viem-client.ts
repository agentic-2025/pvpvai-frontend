import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
  batch: {
    multicall: true
  },
  pollingInterval: 4000,
})
