import messages from '../common/message';
import logger from '../common/utils/logger';
import { request, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import { generateToken } from '../common/utils/auth_jwt';
import { createWalletETH, getBalance } from '../common/utils/external_service';

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
    const response = await User.findOne({ email: req.body.email, password: req.body.password });
    if (!response) {
      return res.status(404).json({
        message: messages.userNotFound,
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
    return res.status(200).json({
      message: messages.success,
      data: { 'user': data, 'balance': balance }
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
    const { id } = req.params
    const response = await User.findOne({ _id: id });
    if (!response) {
      return res.status(404).json({
        message: messages.userNotFound,
        data: {}
      });
    }
    return res.status(200).json({
      message: messages.success,
      data: response.toJSON()
    });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({
      message: error.toString(),
      data: {}
    });
  }
};