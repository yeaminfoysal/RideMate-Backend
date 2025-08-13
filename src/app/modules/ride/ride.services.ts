import { Request } from "express";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./ride.model";
import { Driver } from "../driver/driver.model";

const requestRide = async (req: Request) => {

    const rideData = req.body;
    const riderId = (req.user as { userId: string }).userId;
    const rider = await User.findById(riderId);

    if (!rider) {
        throw new AppError(404, "User is not exist.")
    }

    if (rider.activeRide) {
        const existingRide = await Ride.findById(rider.activeRide);

        if (existingRide && existingRide.status !== "completed") {
            throw new AppError(400, "Already in an active ride.");
        }
    }

    const ride = await Ride.create(
        {
            rider: riderId,
            ...rideData
        })

    rider.activeRide = ride._id;
    await rider.save();

    return ride
}

const cancelRide = async (req: Request) => {
    const rideId = req.params.id;
    const riderId = (req.user as { userId?: string }).userId;
    const ride = await Ride.findById(rideId);

    if (!ride) {
        throw new AppError(400, "Ride does not exist.")
    }

    if (ride?.status !== "requested") {
        throw new AppError(400, "Ride is already on processing")
    }

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        { status: "canceled" },
        { new: true }
    )
    const rider = await User.findByIdAndUpdate(
        riderId,
        { activeRide: null },
        { new: true }
    )
    return { updatedRide, rider }
}

const getAvailableRides = async (driverId: string) => {

    const driver = await Driver.findById(driverId);

    if (driver?.activeRide) {
        throw new AppError(400, "Already in an active ride.")
    }
    if (driver?.approvalStatus !== "approved") {
        throw new AppError(400, "Driveer is not permited for ride at this moment.")
    }

    const availableRides = await Ride.find(
        {
            status: "requested",
            "rejectedBy.driverId": { $ne: driverId }
        }
    );

    return availableRides
}

const rejectRide = async (rideId: string, driverId: string, reason?: string) => {
    const ride = await Ride.findById(rideId);

    if (ride?.status !== "requested") {
        throw new AppError(400, "Ride's status has been changed.")
    }

    const alreadyRejected = ride.rejectedBy.some(
        driver => driver.driverId.toString() == driverId.toString()
    )

    if (alreadyRejected) {
        throw new AppError(400, "You have already rejected this ride.")
    }

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        {
            $push: {
                rejectedBy: {
                    driverId,
                    reason: reason || null
                }
            }
        },
        { new: true }
    )
    return updatedRide;
}

export const RideServices = { requestRide, cancelRide, getAvailableRides, rejectRide }