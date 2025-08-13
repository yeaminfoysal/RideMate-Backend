import { model, Schema } from "mongoose";
import { IDriver } from "./driver.interface";

const driverSchema = new Schema<IDriver>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    approvalStatus: {
        type: String,
        enum: ['suspended', 'approved', 'none'],
        default: 'none'
    },
    isOnline: { type: Boolean, default: false },
    vehicle: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    activeRide: {
        type: Schema.Types.ObjectId,
        ref: "Ride",
        default: null
    },
    totalEarnings: { type: Number, default: 0 },
}, {
    versionKey: false
})

export const Driver = model<IDriver>("Driver", driverSchema);