import { model, Schema } from "mongoose";
import { IRide } from "./ride.interface";

const rideSchema = new Schema<IRide>({
    destination: { type: String, required: true },
    pickup: { type: String, required: true },
    rider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'picked_up', 'in_transit', 'completed'],
        default: "requested"
    }
}, {
    versionKey: false
});

export const Ride = model<IRide>("Ride", rideSchema);