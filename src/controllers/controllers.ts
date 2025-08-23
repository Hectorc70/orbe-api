import messages from '../common/message';
import logger from '../common/utils/logger';
import { request, Request, Response } from 'express';
import User from '../models/userModel';

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