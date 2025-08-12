import { model, Schema } from "mongoose";
import { IDriver } from "./driver.interface";

const driverSchema = new Schema<IDriver>({
    approvalStatus: {
        enum: ['suspended', 'approved', 'none'],
        default: 'none'
    },
    onlineStatus: { enum: ['online', 'offline'] },
    vehicle: { type: String, required: true },
    activeRide: {
        type: Schema.Types.ObjectId,
        ref: "Ride",
        required: true,
        default: 'none'
    }
})

export const Driver = model<IDriver>("Driver", driverSchema);