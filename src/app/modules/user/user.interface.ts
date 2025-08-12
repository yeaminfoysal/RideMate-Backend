import { Types } from "mongoose";

export interface IAuthProvider{
    provider: "google" | "credentials";
    providerId: string
}

export interface Iuser{
    _id?:string,
    name: string,
    email: string,
    password: string,
    role: 'USER' | 'ADMIN' | 'DRIVER',
    activeRide: Types.ObjectId
}