
import { log } from 'console';
import { ethers } from 'ethers';
import logger from './logger';
import IResponseWallet from '../../models/responseWallet';

export async function createWalletETH(): Promise<IResponseWallet> {
  const wallet = ethers.Wallet.createRandom();
  logger.info('🎯 Nueva Wallet Creada:');
  const response: IResponseWallet = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    phrase: wallet.mnemonic?.phrase ?? ''
  }
  return response;
}