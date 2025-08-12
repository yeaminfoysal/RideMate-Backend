import { Types } from "mongoose";

export interface IDriver {
    _id?: Types.ObjectId,
    onlineStatus: "online" | "offline",
    approvalStatus: 'suspended' | 'approved' | 'none',
    vehicle: string,
    activeRide: Types.ObjectId
}