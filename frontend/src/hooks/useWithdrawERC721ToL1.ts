import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
// @ts-ignore
import { CrossChainMessenger, MessageStatus } from '@mantleio/sdk';
import { walletClient as viemWalletClient } from '@/lib/chain';

export type ERC721WithdrawalStatus =
  | 'idle'
  | 'initiating'
  | 'waiting_prove'
  | 'proving'
  | 'waiting_challenge'
  | 'finalizing'
  | 'success'
  | 'error';

export type ERC721WithdrawalStep = {
  status: ERC721WithdrawalStatus;
  message: string;
  progress: number;
};

interface MantleERC721Config {
  l1ChainId: number;
  l2ChainId: number;
  l1RpcUrl: string;
  l2RpcUrl: string;
}

export const useWithdrawERC721ToL1 = (config: MantleERC721Config) => {
  const { address, isConnected } = useAccount();

  const [step, setStep] = useState<ERC721WithdrawalStep>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const withdrawERC721 = useCallback(
    async (l1TokenAddress: `0x${string}`, l2TokenAddress: `0x${string}`, tokenId: string, overrides?: { provider?: any }) => {
      // Validation
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (!viemWalletClient) {
        throw new Error('Wallet client not available');
      }

      setError(null);
      setTxHash('');
      const startTime = Date.now();

      try {
        const providerToUse = overrides?.provider || (typeof window !== 'undefined' ? (window as any).ethereum : undefined);

        // Get account from wallet client
        if (!viemWalletClient) throw new Error("Wallet not available. Connect a wallet.");
        const [account] = await viemWalletClient.getAddresses();
        if (!account) throw new Error("No account connected.");

        // Import ethers dynamically
        const ethers = await import('ethers');

        // Create ethers providers
        const l1Provider = new ethers.providers.JsonRpcProvider(config.l1RpcUrl);
        const l2Provider = new ethers.providers.JsonRpcProvider(config.l2RpcUrl);

        // Create Web3Provider from window.ethereum for L2 signer
        const web3Provider = new ethers.providers.Web3Provider(providerToUse);
        const l2Signer = web3Provider.getSigner();

        // Initialize CrossChainMessenger with user's wallet
        setStep({
          status: 'idle',
          message: 'Initializing bridge...',
          progress: 5,
        });

        const messenger = new CrossChainMessenger({
          l1ChainId: config.l1ChainId,
          l2ChainId: config.l2ChainId,
          l1SignerOrProvider: l1Provider,
          l2SignerOrProvider: l2Signer,
          bedrock: true,
        });

        // Step 1: Initiate withdrawal on L2
        setStep({
          status: 'initiating',
          message: 'Initiating ERC721 withdrawal from L2... (confirm in wallet)',
          progress: 15,
        });

        const withdrawTx = await messenger.withdrawERC721(
          l1TokenAddress,
          l2TokenAddress,
          tokenId
        );

        setTxHash(withdrawTx.hash);
        console.log(`ERC721 withdrawal transaction hash: ${withdrawTx.hash}`);

        setStep({
          status: 'initiating',
          message: 'Waiting for L2 confirmation...',
          progress: 25,
        });
        await withdrawTx.wait();

        // Step 2: Wait for state root to be published to L1
        setStep({
          status: 'waiting_prove',
          message: 'Waiting for state root to be published to L1 (this may take several minutes)...',
          progress: 40,
        });

        await messenger.waitForMessageStatus(
          withdrawTx.hash,
          MessageStatus.READY_TO_PROVE
        );

        // Step 3: Prove the withdrawal on L1
        setStep({
          status: 'proving',
          message: 'Proving withdrawal on L1... (confirm in wallet)',
          progress: 60,
        });

        const proveTx = await messenger.proveMessage(withdrawTx.hash);
        console.log(`Prove transaction hash: ${proveTx.hash}`);

        setStep({
          status: 'proving',
          message: 'Waiting for prove confirmation...',
          progress: 70,
        });
        await proveTx.wait();

        // Step 4: Wait for challenge period
        setStep({
          status: 'waiting_challenge',
          message: 'Waiting for challenge period (this may take up to 7 days on mainnet, shorter on testnet)...',
          progress: 75,
        });

        await messenger.waitForMessageStatus(
          withdrawTx.hash,
          MessageStatus.IN_CHALLENGE_PERIOD
        );

        console.log('In the challenge period, waiting for status READY_FOR_RELAY');
        await messenger.waitForMessageStatus(
          withdrawTx.hash,
          MessageStatus.READY_FOR_RELAY
        );

        // Step 5: Finalize withdrawal on L1
        setStep({
          status: 'finalizing',
          message: 'Finalizing withdrawal on L1... (confirm in wallet)',
          progress: 90,
        });

        const finalizeTx = await messenger.finalizeMessage(withdrawTx.hash, {
          overrides: {
            gasLimit: 4700000,
          },
        });
        console.log(`Finalize transaction hash: ${finalizeTx.hash}`);

        setStep({
          status: 'finalizing',
          message: 'Waiting for finalization...',
          progress: 95,
        });
        await finalizeTx.wait();

        // Success
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        setStep({
          status: 'success',
          message: `ERC721 withdrawal complete in ${duration}s!`,
          progress: 100,
        });

        return {
          success: true,
          txHash: withdrawTx.hash,
          proveTxHash: proveTx.hash,
          finalizeTxHash: finalizeTx.hash,
          tokenId,
        };
      } catch (err: any) {
        console.error('ERC721 withdrawal error:', err);

        // Parse error message
        let errorMessage = 'Withdrawal failed';
        if (err?.message) {
          if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas';
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
    withdrawERC721,
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