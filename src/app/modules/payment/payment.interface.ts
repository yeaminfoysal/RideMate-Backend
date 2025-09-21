/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PAYMENT_STATUS {
    PAID = "PAID",
    UNPAID = "UNPAID",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}

export interface IPayment {
    _id?: string,
    ride: Types.ObjectId;
    transactionId: string;
    paymentUrl?: string;
    amount: number;
    paymentGatewayData?: any
    invoiceUrl?: string
    status: PAYMENT_STATUS
}