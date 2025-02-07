export const diamondAbi = [
    { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
    { type: 'fallback', stateMutability: 'payable' },
    { type: 'receive', stateMutability: 'payable' },
    {
      type: 'function',
      inputs: [
        { name: '_facetAddress', internalType: 'address', type: 'address' },
        {
          name: '_functionSelectors',
          internalType: 'bytes4[]',
          type: 'bytes4[]',
        },
      ],
      name: 'addFacet',
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      inputs: [],
      name: 'owner',
      outputs: [{ name: '', internalType: 'address', type: 'address' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      inputs: [],
      name: 'renounceOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      anonymous: false,
      inputs: [
        {
          name: 'facetAddress',
          internalType: 'address',
          type: 'address',
          indexed: true,
        },
        {
          name: 'selectors',
          internalType: 'bytes4[]',
          type: 'bytes4[]',
          indexed: false,
        },
      ],
      name: 'DiamondCut',
    },
    {
      type: 'event',
      anonymous: false,
      inputs: [
        {
          name: 'previousOwner',
          internalType: 'address',
          type: 'address',
          indexed: true,
        },
        {
          name: 'newOwner',
          internalType: 'address',
          type: 'address',
          indexed: true,
        },
      ],
      name: 'OwnershipTransferred',
    },
    {
      type: 'error',
      inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
      name: 'OwnableInvalidOwner',
    },
    {
      type: 'error',
      inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
      name: 'OwnableUnauthorizedAccount',
    },
  ] as const
  