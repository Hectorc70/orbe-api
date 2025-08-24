import messages from '../common/message';
import logger from '../common/utils/logger';
import { request, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import { generateToken, getTokenFromHeaders, verifyToken } from '../common/utils/auth_jwt';
import { createWalletETH, getBalance, getBalanceNative, sendUSDC, swapNativeToUSDC } from '../common/utils/external_service';
import { parse } from 'path';
import { Transaction } from '../models/transactionModel';

export const createUser = async (req: Request, res: Response) => {
  try {
    const responseWallet = await createWalletETH();
    const model = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      walletAddress: responseWallet
    }
    await User.create(model);

    return res.status(200).json({
      message: messages.success,
      data: {}
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
      data: {}
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const response = await User.findOne({ email: email });
    if (!response) {
      return res.status(404).json({
        message: messages.userNotFound,
        data: {}
      });
    }
    if (response.password !== password) {
      return res.status(400).json({
        message: messages.passwordInvalid,
        data: {}
      });
    }

    const token = generateToken({ id: response._id, email: response.email });
    return res.status(200).json({
      message: messages.success,
      data: {
        token,
        id: response._id
      }
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
      data: {}
    });
  }

};
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const response = await User.findOne({ _id: id });
    if (!response) {
      return res.status(404).json({
        message: messages.userNotFound,
        data: {}
      });
    }
    const data = response.toJSON()
    const balance = await getBalance(response.walletAddress.address);
    const balanceNative = await getBalanceNative(response.walletAddress.address);
    return res.status(200).json({
      message: messages.success,
      data: { 'user': data, 'balance': balance, 'balanceNative': balanceNative }
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
      data: {}
    });
  }
};

export const sendAmount = async (req: Request, res: Response) => {
  try {

    const { send_to, typeSend, amount } = req.body
    logger.info(`🎯 Nueva Transferencia send_to:${send_to} typeSend:${typeSend} amount:${amount}`);
    try {
      const token = getTokenFromHeaders(req) as string;
      const payload = verifyToken(token);
      let addressTo = send_to
      if (parseInt(typeSend) === 1) {
        const response = await User.findOne({ email: send_to });
        if (!response) {
          return res.status(404).json({
            message: messages.userNotFound,
            data: {}
          });
        }
        addressTo = response.walletAddress.address
      }
      const userFrom = await User.findOne({ _id: payload && payload.id });
      if (!userFrom) {
        return res.status(404).json({
          message: messages.userNotFound,
          data: {}
        });
      }
      const resultTransfer = await sendUSDC(userFrom.walletAddress.privateKey, addressTo, parseFloat(amount));
      const data = {
        typeSend,
        from: userFrom._id.toString(),
        to: send_to,
        amount: parseFloat(amount),
        status: 1,
        hash: resultTransfer
      }
      await Transaction.create(data);
    } catch (error: any) {
      logger.error(error);
      return res.status(400).json({
        message: messages.error,
        data: { 'error': error.toString() }
      });
    }
    return res.status(200).json({
      message: messages.success,
      data: {}
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
      data: {}
    });
  }
};


export const swapAmount = async (req: Request, res: Response) => {
  try {

    const { amount } = req.body

    try {
      const token = getTokenFromHeaders(req) as string;
      const payload = verifyToken(token);
      const userFrom = await User.findOne({ _id: payload && payload.id });
      if (!userFrom) {
        return res.status(404).json({
          message: messages.userNotFound,
          data: {}
        });
      }


      await swapNativeToUSDC(userFrom.walletAddress.privateKey, parseFloat(amount));
    } catch (error: any) {
      logger.error(error);
      return res.status(400).json({
        message: messages.error,
        data: { 'error': error.toString() }
      });
    }
    return res.status(200).json({
      message: messages.success,
      data: {}
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
      data: {}
    });
  }
};