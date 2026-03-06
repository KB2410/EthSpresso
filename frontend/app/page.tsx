'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { injected } from 'wagmi/connectors';

// Deployed BuyMeACoffee contract on Sepolia testnet
const CONTRACT_ADDRESS = '0x89fFbaeDFcCC9FC357B63CE2C991962Edf3f6045' as const;

const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'string', name: 'message', type: 'string' },
    ],
    name: 'NewMemo',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_message', type: 'string' },
    ],
    name: 'buyCoffee',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMemos',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'message', type: 'string' },
        ],
        internalType: 'struct BuyMeACoffee.Memo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'memos',
    outputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'message', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('0.001');

  // Read memos from contract
  const { data: memos, refetch: refetchMemos } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getMemos',
  });

  // Write contract
  const { data: hash, writeContract, isPending: isWritePending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Refetch memos after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      refetchMemos();
      setName('');
      setMessage('');
    }
  }, [isConfirmed, refetchMemos]);

  const handleBuyCoffee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !message || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'buyCoffee',
        args: [name, message],
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Error buying coffee:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">☕ EthSpresso</h1>
          <p className="text-lg text-amber-700">Buy me a coffee on the blockchain!</p>
        </header>

        {/* Wallet Connection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {!isConnected ? (
            <button
              onClick={() => connect({ connector: injected() })}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="font-mono text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Buy Coffee Form */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Send a Tip</h2>
            <form onSubmit={handleBuyCoffee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your name"
                  disabled={isWritePending || isConfirming}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  placeholder="Say something nice!"
                  rows={3}
                  disabled={isWritePending || isConfirming}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  placeholder="0.001"
                  disabled={isWritePending || isConfirming}
                />
              </div>

              <button
                type="submit"
                disabled={isWritePending || isConfirming}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isWritePending ? 'Waiting for Wallet...' : isConfirming ? 'Transaction Pending...' : 'Buy Coffee ☕'}
              </button>

              {isConfirmed && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  ✅ Coffee sent successfully!
                </div>
              )}
            </form>
          </div>
        )}

        {/* Memos List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Recent Tips</h2>
          {!memos || memos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tips yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {[...memos].reverse().map((memo: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-amber-900">{memo.name}</p>
                      <p className="text-sm text-gray-600 font-mono">
                        {memo.from.slice(0, 6)}...{memo.from.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{formatEther(memo.timestamp > 0 ? BigInt(0) : BigInt(0))} ETH</p>
                      <p className="text-xs text-gray-500">
                        {new Date(Number(memo.timestamp) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{memo.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
