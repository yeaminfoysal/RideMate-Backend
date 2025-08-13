import { NextFunction, Request, Response } from "express";
import { RideServices } from "./ride.services";
import { Ride } from "./ride.model";

const requestRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ride = await RideServices.requestRide(req);

        res.status(200).json({
            success: true,
            message: "Request for ride successfull",
            data: ride
        })
    } catch (error) {
        next(error)
    }
}

const cancelRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rideAndUser = await RideServices.cancelRide(req);

        res.status(200).json({
            success: true,
            message: "Canceled ride request successfully.",
            data: rideAndUser
        })
    } catch (error) {
        next(error)
    }
}
const getMyRides = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as { userId: string }).userId;
        const rides = await Ride.find({ rider: userId });

        res.status(200).json({
            success: true,
            message: "My rides retrieved successfully.",
            data: rides
        })
    } catch (error) {
        next(error)
    }
}

export const RideController = { requestRide, cancelRide, getMyRides }