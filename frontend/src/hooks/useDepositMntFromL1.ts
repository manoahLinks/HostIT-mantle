import { useState, useCallback } from 'react';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
// @ts-ignore
import { CrossChainMessenger, MessageStatus } from '@mantleio/sdk';
import { walletClient as viemWalletClient } from '@/lib/chain';

export type DepositStatus =
  | 'idle'
  | 'approving'
  | 'depositing'
  | 'waiting_l1'
  | 'waiting_l2'
  | 'success'
  | 'error';

export type DepositStep = {
  status: DepositStatus;
  message: string;
  progress: number;
};

interface MantleDepositConfig {
  l1ChainId: number;
  l2ChainId: number;
  l1RpcUrl: string;
  l2RpcUrl: string;
  l1MntAddress: `0x${string}`;
  l2MntAddress: `0x${string}`;
}

export const useMantleDeposit = (config: MantleDepositConfig) => {
  const { address, isConnected } = useAccount();

  const [step, setStep] = useState<DepositStep>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const depositMNT = useCallback(
    async (amount: string, overrides?: { provider?: any }) => {
      // Validation
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      setError(null);
      setTxHash('');
      const startTime = Date.now();

      try {
        const providerToUse = overrides?.provider || (typeof window !== 'undefined' ? (window as any).ethereum : undefined);
        if (!providerToUse) throw new Error("No wallet provider available");

        // Import ethers dynamically
        const ethers = await import('ethers');

        // Create ethers providers
        const l1Provider = new ethers.providers.JsonRpcProvider(config.l1RpcUrl); // Note: config.l1RpcUrl might be env var in other contexts, here it's passed
        // Use env if config is missing? but config is required. 
        // Existing code used: process.env.L1_RPC for l1Provider, checking original code...
        // Original: const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1_RPC);
        // But hook arg has config.l1RpcUrl. I should probably use that or stick to what was there if it was working? 
        // The original code used process.env.L1_RPC. I will stick to process.env.L1_RPC to be safe or prefer config if it's correct. 
        // The hook signature: useMantleDeposit(config: MantleDepositConfig)
        // config has l1RpcUrl. Let's use config.l1RpcUrl to be cleaner, assuming it's passed correctly.

        // Use config values instead of process.env to respect the hook interface
        const ethL1Provider = new ethers.providers.JsonRpcProvider(config.l1RpcUrl);
        const ethL2Provider = new ethers.providers.JsonRpcProvider(config.l2RpcUrl);

        // Create Web3Provider from provider for L1 signer
        const web3Provider = new ethers.providers.Web3Provider(providerToUse);
        const l1Signer = web3Provider.getSigner();

        // Initialize CrossChainMessenger with user's wallet
        setStep({
          status: 'idle',
          message: 'Initializing bridge...',
          progress: 5,
        });

        const messenger = new CrossChainMessenger({
          l1ChainId: config.l1ChainId,
          l2ChainId: config.l2ChainId,
          l1SignerOrProvider: l1Signer,
          l2SignerOrProvider: ethL2Provider,
          bedrock: true,
        });

        const depositAmount = parseEther(amount);

        // Step 1: Approve MNT
        setStep({
          status: 'approving',
          message: 'Approving MNT for bridge... (confirm in wallet)',
          progress: 15,
        });

        const approveTx = await messenger.approveERC20(
          config.l1MntAddress, // Use config
          config.l2MntAddress, // Use config
          depositAmount.toString()
        );

        setStep({
          status: 'approving',
          message: 'Waiting for approval confirmation...',
          progress: 25,
        });
        await approveTx.wait();

        // Step 2: Deposit MNT
        setStep({
          status: 'depositing',
          message: 'Initiating deposit to L2... (confirm in wallet)',
          progress: 40,
        });

        const depositTx = await messenger.depositMNT(depositAmount.toString());
        setTxHash(depositTx.hash);
        console.log(`MNT deposit transaction hash: ${depositTx.hash}`);

        // Step 3: Wait for L1 confirmation
        setStep({
          status: 'waiting_l1',
          message: 'Waiting for L1 confirmation...',
          progress: 60,
        });
        await depositTx.wait();

        // Step 4: Wait for L2 relay
        setStep({
          status: 'waiting_l2',
          message: 'Waiting for L2 relay (this may take a few minutes)...',
          progress: 80,
        });

        await messenger.waitForMessageStatus(
          depositTx.hash,
          MessageStatus.RELAYED
        );

        // Success
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        setStep({
          status: 'success',
          message: `Deposit complete in ${duration}s!`,
          progress: 100,
        });

        return {
          success: true,
          txHash: depositTx.hash,
          amount,
        };
      } catch (err: any) {
        console.error('MNT deposit error:', err);

        // Parse error message
        let errorMessage = 'Deposit failed';
        if (err?.message) {
          if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else {
            errorMessage = err.message;
          }
        }

        const error = new Error(errorMessage);
        setError(error);
        setStep({
          status: 'error',
          message: errorMessage,
          progress: 0,
        });

        throw error;
      }
    },
    [isConnected, address, config]
  );

  const reset = useCallback(() => {
    setStep({ status: 'idle', message: '', progress: 0 });
    setTxHash('');
    setError(null);
  }, []);

  return {
    depositMNT,
    reset,
    step,
    txHash,
    error,
    isLoading: step.status !== 'idle' && step.status !== 'success' && step.status !== 'error',
    isSuccess: step.status === 'success',
    isError: step.status === 'error',
    // Legacy compatibility
    status: step.message,
    progress: step.progress,
  };
};