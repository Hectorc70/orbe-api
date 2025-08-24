
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
  let balance = '0.00';
  try {
    const usdcBalanceBigInt = BigInt(response.data.result);
    const usdcDecimals = 6;
    const usdcBalance = Number(usdcBalanceBigInt) / Math.pow(10, usdcDecimals);
    balance = usdcBalance.toFixed(2);


  } catch (error) {
    logger.error(error);
  }

  return balance;
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
  let balance = '0.00';
  try {
    const monBalanceBigInt = BigInt(response.data.result);
    const monDecimals = 18;
    const monBalanceFloat = Number(monBalanceBigInt) / Math.pow(10, monDecimals);
    balance = monBalanceFloat.toFixed(2);


  } catch (error) {
    logger.error(error);
  }

  return balance;
}



export async function sendUSDC(fromPrivateKey: string, toAddress: string, amount: number): Promise<string> {
  const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
  const wallet = new ethers.Wallet(fromPrivateKey, provider);
  const nonce = await provider.getTransactionCount(wallet.address, 'latest');
  const usdcAddress = "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea";

  const decimals = 6;
  const amountRequest = ethers.parseUnits(amount.toString(), decimals);

  const abi = ["function transfer(address to, uint256 amount)"];
  const iface = new ethers.Interface(abi);
  const data = iface.encodeFunctionData("transfer", [toAddress, amountRequest]);

  const tx = {
    to: usdcAddress,
    nonce: nonce,
    gasLimit: '0x186A0', // 100,000 gas
    gasPrice: ethers.parseUnits('52', 'gwei'), // 10 Gwei
    data: data,
    chainId: 10143
  };
  const signedTx = await wallet.signTransaction(tx);
  logger.info('Transacción firmada:', signedTx);
  const txResponse = await provider.broadcastTransaction(signedTx);
  logger.info('Hash de transacción:', txResponse.hash);
  logger.info('Explorer: https://testnet.monadexplorer.com/tx/' + txResponse.hash);
  return txResponse.hash;
}


