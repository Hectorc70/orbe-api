
import { log } from 'console';
import { ethers } from 'ethers';
import logger from './logger';
import IResponseWallet from '../../models/responseWallet';
import axios from 'axios';

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

export async function getBalance(address: string): Promise<string> {
  const addressWithout0x = address.slice(2);
  const response = await axios.post('https://testnet-rpc.monad.xyz/', {
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea",
        "data": "0x70a08231000000000000000000000000" + addressWithout0x
      },
      "latest"
    ],
    "id": 1
  }
  )
  if (response.status != 200) {
    return '0.00';
  }
  const ammount =response.data.result ?  await convertTOAmount(response.data.result) : '0.00';
  return ammount;
}

const convertTOAmount = (amount: string): string => {
  if (amount) {
    return (Number(amount) / 10 ** 18).toFixed(2);
  }
  return '0.00';
}

export async function getBalanceNative(address: string): Promise<string> {
  const addressWithout0x = address.slice(2);
  const response = await axios.post('https://testnet-rpc.monad.xyz/', {
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": [
      address,
      "latest"
    ],
    "id": 0
  }
  )
  if (response.status != 200) {
    return '0.00';
  }
  const ammount =response.data.result ?  await convertTOAmount(response.data.result) : '0.00';
  return ammount;
}