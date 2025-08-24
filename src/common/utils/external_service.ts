
import { log } from 'console';
import { concat, ethers, Wallet } from 'ethers';
import logger from './logger';
import IResponseWallet from '../../models/responseWallet';
import axios from 'axios';
import qs from 'qs';

import { createPublicClient, createWalletClient, http, erc20Abi, parseUnits, publicActions, Hex, numberToHex, size, concatHex, pad } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
const NATIVE_ALIAS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const;
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

export async function swapNativeToUSDC(fromPrivateKey: string, amount: number): Promise<string> {

  const client = createWalletClient({
    account: privateKeyToAccount(fromPrivateKey as Hex),
    chain: monadTestnet,
    transport: http(process.env.ALCHEMY_HTTP_TRANSPORT_URL!), // e.g. https://base-mainnet.g.alchemy.com/v2/KEY
  }).extend(publicActions);
  // const taker = new Wallet(fromPrivateKey).address;

  const headers = {
    '0x-api-key': process.env.OX_API_KEY as string, // REQUERIDO
    '0x-version': 'v2',
  };
  // const sellToken = '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701';
  const sellToken = NATIVE_ALIAS;
  const buyToken = '0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149';
  const decimals = 18;
  const sellAmount = parseUnits(String(amount), decimals).toString();

  const params = { sellToken, buyToken, sellAmount, taker: client.account.address, chainId: String(10143) };

  const { data } = await axios.get(
    `https://api.0x.org/swap/permit2/quote`,
    { params, paramsSerializer: p => qs.stringify(p), headers }
  );
  const isNativeSell = sellToken.toLowerCase() === NATIVE_ALIAS.toLowerCase();

  let signature: Hex | undefined;
  let dataToSend: Hex = data.transaction.data;
  if (!isNativeSell && data.permit2?.eip712) {
    const e = data.permit2.eip712;
    const signature = await client.signTypedData({
      account: client.account,
      domain: e.domain,
      types: e.types,
      message: e.message,
      primaryType: e.primaryType,
    });

    const byteLen = (signature.length - 2) / 2;
    const lenWord = pad(numberToHex(byteLen), { size: 32 });
    dataToSend = concatHex([data.transaction.data, lenWord, signature]);
  }
  // if (data.permit2?.eip712) {
  //   try {
  //     const e = data.permit2.eip712;
  //     signature = await client.signTypedData({
  //       account: client.account,
  //       domain: e.domain,
  //       types: e.types,
  //       message: e.message,
  //       primaryType: e.primaryType,
  //     });
  //     console.log("Signed permit2 message from quote response");
  //   } catch (error) {
  //     console.error("Error signing permit2 coupon:", error);
  //   }
  //   if (signature && data?.transaction?.data) {
  //     const signatureLengthInHex = numberToHex(size(signature), {
  //       signed: false,
  //       size: 32,
  //     });
  //     const transactionData = data.transaction.data as Hex;
  //     const sigLengthHex = signatureLengthInHex as Hex;
  //     const sig = signature as Hex;
  //     data.transaction.data = concat([transactionData, sigLengthHex, sig]);
  //   } else {
  //     throw new Error("Failed to obtain signature or transaction data");
  //   }
  // }
  // if (signature && data.transaction.data) {
  //   const nonce = await client.getTransactionCount({
  //     address: client.account.address,
  //   });

  //   // const signedTransaction = await client.signTransaction();
  //   const hash = await client.sendTransaction({
  //     account: client.account,
  //     chain: client.chain,
  //     gas: data?.transaction.gas ? BigInt(data.transaction.gas) : undefined,
  //     to: data?.transaction.to,
  //     data: data.transaction.data,
  //     value: data?.transaction.value
  //       ? BigInt(data.transaction.value)
  //       : undefined, // value is used for native tokens
  //     gasPrice: !!data?.transaction.gasPrice
  //       ? BigInt(data?.transaction.gasPrice)
  //       : undefined,
  //     nonce: nonce,
  //   });
  //   // console.log("Transaction hash:", hash);
  //   logger.info('Explorer: https://testnet.monadexplorer.com/tx/' + hash);
  //   return hash
  // }

  // return data.transaction.hash
  const nonce = await client.getTransactionCount({
    address: client.account.address,
  });
  const signedTransaction = await client.signTransaction({
    account: client.account,
    chain: client.chain,
    gas: !!data?.transaction.gas
      ? BigInt(data?.transaction.gas)
      : undefined,
    to: data?.transaction.to,
    data: data.transaction.data,
    value: data?.transaction.value
      ? BigInt(data.transaction.value)
      : undefined, // value is used for native tokens
    gasPrice: !!data?.transaction.gasPrice
      ? BigInt(data?.transaction.gasPrice)
      : undefined,
    nonce: nonce,
  });
  // const hash = await client.sendRawTransaction({
  //   to: dataToSend.transaction.to,
  //   data: dataToSend,
  //   value: dataToSend.transaction.value ? BigInt(data.transaction.value) : BigInt(0),
  //   gas: dataToSend.transaction.gas ? BigInt(data.transaction.gas) : undefined,
  //   gasPrice: data.transaction.gasPrice ? BigInt(data.transaction.gasPrice) : undefined,
  // });
  const hash = await client.sendRawTransaction({
    serializedTransaction: signedTransaction,
  });

  return hash;
}


