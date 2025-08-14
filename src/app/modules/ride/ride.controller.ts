import { NextFunction, Request, Response } from "express";
import { RideServices } from "./ride.services";
import { Ride } from "./ride.model";

const requestRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ride = await RideServices.requestRide(req);

        res.status(201).json({
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

const getAvailableRides = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driverId = (req.user as { driverId: string }).driverId;
        const rides = await RideServices.getAvailableRides(driverId);

        res.status(200).json({
            success: true,
            message: "Available rides retrieved successfully.",
            data: rides
        })
    } catch (error) {
        next(error)
    }
}

const getMyRides = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rides = await RideServices.getMyRides(req)

        res.status(200).json({
            success: true,
            message: "My rides retrieved successfully.",
            data: rides || []
        });

    } catch (error) {
        next(error)
    }
}

const rejectRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { driverId } = req.user as { driverId: string };
        const reason = req.body?.reason;

        const ride = await RideServices.rejectRide(
            req.params.id,
            driverId,
            reason
        );

        res.status(200).json({
            success: true,
            message: "Ride rejected successfully.",
            data: ride
        })
    } catch (error) {
        next(error)
    }
}

const acceptRide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driverId = (req.user as { driverId: string }).driverId;

        const ride = await RideServices.acceptRide(
            req.params.id,
            driverId
        );

        res.status(200).json({
            success: true,
            message: "Ride accepted successfully.",
            data: ride
        })
    } catch (error) {
        next(error)
    }
}

const getAllRides = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rides = await Ride.find();

        res.status(200).json({
            success: true,
            message: "Rides retrieved successfully.",
            data: rides
        })
    } catch (error) {
        next(error)
    }
}

const updateRideStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driverId = (req.user as { driverId: string }).driverId;

        const rides = await RideServices.updateRideStatus(
            req.params.id,
            driverId,
            req.body.status
        );

        res.status(200).json({
            success: true,
            message: "Ride status updated successfully.",
            data: rides
        })
    } catch (error) {
        next(error)
    }
}

export const RideController = {
    requestRide,
    cancelRide,
    getMyRides,
    getAvailableRides,
    rejectRide,
    acceptRide,
    getAllRides,
    updateRideStatus
}