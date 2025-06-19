import { Document, Model, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface IUser {
  name: string;
  email: string;
  password: string;
}

interface IUserMethods {
  generateJWT: () => Promise<string>;
  validatePassword: (password: string) => Promise<boolean>;
}

type UserDocument = Document & IUser & IUserMethods;

const userSchema = new Schema<IUser, Model<UserDocument>, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateJWT = async function () {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  const token = await jwt.sign({ _id: this._id }, secret, { expiresIn: "1d" });

  return token;
};

userSchema.methods.validatePassword = async function (userPassword: string) {
  const isPasswordValid = await bcrypt.compare(userPassword, this.password);

  return isPasswordValid;
};

const User = model("User", userSchema);

export default User;
