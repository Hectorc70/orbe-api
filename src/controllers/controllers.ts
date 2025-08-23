import messages from '../common/message';
import logger from '../common/utils/logger';
import { request, Request, Response } from 'express';
import User from '../models/userModel';
import { generateToken } from '../common/utils/auth_jwt';

export const createUser = async (req: Request, res: Response) => {
  try {
    await User.create(req.body);
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
        token
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