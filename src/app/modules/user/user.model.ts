import { model, Schema } from "mongoose";
import { IAuthProvider, IEmmergencyContact, Iuser } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
    {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
    },
    { _id: false }
);

const emergencyContact = new Schema<IEmmergencyContact>(
    {
        email: { type: String, required: true },
        phone: { type: String, required: true },
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
        emergencyContact: {
            type: emergencyContact,
            default: {
                phome: null,
                email: null
            },
        },
        isBlocked: { type: Boolean, default: false },
        phone: { type: String },
    },
    {
        versionKey: false,
    }
);


export const User = model<Iuser>("User", userSchema);
