import { Request } from "express";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./ride.model";

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

export const RideServices = { requestRide }