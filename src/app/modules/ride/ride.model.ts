import { model, Schema } from "mongoose";
import { IRide } from "./ride.interface";

const locationSchema = new Schema(
    {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    { _id: false }
);

const rideSchema = new Schema<IRide>({
    pickup: { type: locationSchema, required: true },
    destination: { type: locationSchema, required: true },
    rider: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    status: {
        type: String,
        enum: ['canceled', 'requested', 'accepted', 'picked_up', 'in_transit', 'completed'],
        default: "requested"
    },
    fare: { type: Number, default: 0 },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    completedAt: { type: Date },
    rejectedBy: [
        {
            driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
            rejectedAt: { type: Date, default: Date.now },
            reason: { type: String, default: null }
        }
    ]
}, {
    versionKey: false
});

export const Ride = model<IRide>("Ride", rideSchema);