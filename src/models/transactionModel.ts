
import { Schema, model } from 'mongoose';

export default interface ITransaction {
  from: string;
  to: string;
  typeSend: number // 0 = external, 1 = internal
  amount: number;
  status: number; // 0 = pending, 1 = success
  hash?: string
}

const transactionSchema = new Schema<ITransaction>({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  typeSend: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: Number,
    required: true,
    default: 0
  },
  hash: {
    type: String,
    required: false,
    unique: true
  }
}, {
  timestamps: true,
});
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
export const Transaction = model<ITransaction>('Transaction', transactionSchema);
