import { Types } from "mongoose";

export interface IRide {
    _id?: string,
    rider: Types.ObjectId,
    driver: Types.ObjectId,
    pickup: string,
    destination: string,
    status: 'requested' | 'accepted' | 'picked_up' | 'in_transit' | 'completed',
}