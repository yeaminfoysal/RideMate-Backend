import { Types } from "mongoose";

export interface ILocation {
    address: string;
    lat: number;
    lng: number;
}

export interface IRide {
    _id?: Types.ObjectId,
    rider?: Types.ObjectId,
    driver?: Types.ObjectId,
    pickup: ILocation;
    destination: ILocation;
    status: 'canceled' | 'requested' | 'accepted' | 'picked_up' | 'in_transit' | 'completed',
    fare?: number;
    requestedAt?: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    completedAt?: Date;
    rejectedBy: {
        driverId: Types.ObjectId;
        rejectedAt: Date;
        reason?: string;
    }[];
}