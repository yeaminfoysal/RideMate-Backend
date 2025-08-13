import { NextFunction, Request, Response } from "express";
import { RideServices } from "./ride.services";

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

export const RideController = { requestRide }