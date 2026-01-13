// hooks/useMantleDeposit.ts
import { useState, useCallback } from 'react';
import { parseEther, formatEther } from 'viem';
// @ts-ignore
import { CrossChainMessenger, MessageStatus } from '@mantleio/sdk';

interface DepositConfig {
  l1ChainId: number;
  l2ChainId: number;
  l1RpcUrl: string;
  l2RpcUrl: string;
  privateKey: string;
  l1MntAddress: string;
  l2MntAddress: string;
}


export const useMantleDeposit = (config: DepositConfig) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [txHash, setTxHash] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
  
    // Initialize CrossChainMessenger
    const createMessenger = useCallback(() => {
      const ethers = require('ethers');
      const l1Provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_L1_RPC);
      const l2Provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_L2_RPC!);
      const l1Wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIV_KEY, l1Provider);
      const l2Wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIV_KEY, l2Provider);
  
      return new CrossChainMessenger({
        l1ChainId: config.l1ChainId,
        l2ChainId: config.l2ChainId,
        l1SignerOrProvider: l1Wallet,
        l2SignerOrProvider: l2Wallet,
        bedrock: true,
      });
    }, [config]);

      // Deposit MNT from L1 to L2
  const depositMNT = useCallback(async (amount: string) => {
    setIsLoading(true);
    setProgress(0);
    const startTime = Date.now();

    try {
      const messenger = createMessenger();
      const depositAmount = parseEther(amount);

      // MNT requires approval first
      setStatus('Approving MNT...');
      setProgress(15);
      
      const l1MntAddr = process.env.NEXT_PUBLIC_L1_MNT as `0x${string}`;
      const l2MntAddr = process.env.NEXT_PUBLIC_L2_MNT as `0x${string}`;

      const approveTx = await messenger.approveERC20(
        l1MntAddr,
        l2MntAddr,
        depositAmount.toString()
      );
      await approveTx.wait();

      setStatus('Depositing MNT...');
      setProgress(40);

      const depositTx = await messenger.depositMNT(depositAmount.toString());
      setTxHash(depositTx.hash);
      console.log(`MNT deposit transaction hash: ${depositTx.hash}`);
      
      setStatus('Waiting for L1 confirmation...');
      setProgress(60);
      await depositTx.wait();

      setStatus('Waiting for L2 relay...');
      setProgress(80);
      
      await messenger.waitForMessageStatus(depositTx.hash, MessageStatus.RELAYED);

      setProgress(100);
      setStatus(`MNT deposit complete! Took ${(Date.now() - startTime) / 1000}s`);
      
      return {
        success: true,
        txHash: depositTx.hash,
        amount,
      };
    } catch (error: any) {
      console.error('MNT deposit error:', error);
      setStatus(`MNT deposit failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, [createMessenger]);

  return {
    isLoading,
    status,
    txHash,
    progress,
    depositMNT,
  };
}