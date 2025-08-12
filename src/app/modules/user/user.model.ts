import { model, Schema } from "mongoose";
import { Iuser } from "./user.interface";

const userSchema = new Schema<Iuser>({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: ['ADMIN', 'USER', 'DRIVER'],
        default: "USER"
    },
    activeRide: {
        type: Schema.Types.ObjectId,
        ref: "Ride",
        required: true,
        default: 'none'
    }
})

export const User = model<Iuser>("User", userSchema);