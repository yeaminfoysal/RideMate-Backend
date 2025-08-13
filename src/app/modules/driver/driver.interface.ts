import { Types } from "mongoose";

export interface IDriver {
    _id?: Types.ObjectId,
    user: Types.ObjectId;
    isOnline: boolean,
    approvalStatus: 'suspended' | 'approved' | 'none',
    vehicle: string,
    activeRide: Types.ObjectId | null,
    totalEarnings: number,
    licenseNumber: string
}