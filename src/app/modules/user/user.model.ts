import { model, Schema } from "mongoose";
import { IAuthProvider, Iuser } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<Iuser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["ADMIN", "USER", "DRIVER"],
      default: "USER",
    },
    activeRide: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      default: null,
    },
    auths: {
      type: [authProviderSchema],
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

export const User = model<Iuser>("User", userSchema);
