import { Types } from "mongoose";

export interface IAuthProvider {
    provider: "google" | "credentials";
    providerId: string
}

export interface IEmmergencyContact {
    email: string;
    phone: string
}

export interface Iuser {
    _id?: Types.ObjectId,
    name: string,
    email: string,
    password: string,
    role: 'USER' | 'ADMIN' | 'DRIVER',
    activeRide: Types.ObjectId | null;
    auths: IAuthProvider[];
    isBlocked: boolean,
    phone?: string,
    emergencyContact?: IEmmergencyContact
}