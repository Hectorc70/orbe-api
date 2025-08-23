import { Schema, model } from 'mongoose';
import IResponseWallet from './responseWallet';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  walletAddress: IResponseWallet;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true
});

userSchema.index({ email: 1 });

// 🔑 Sobrescribir toJSON para ocultar campos
userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.__v;

    // 👇 Primero validar
    if (ret.walletAddress) {
      delete ret.walletAddress.privateKey;
      delete ret.walletAddress.phrase;
    }

    return ret;
  },
});
const User = model<IUser>('User', userSchema);
export default User;
