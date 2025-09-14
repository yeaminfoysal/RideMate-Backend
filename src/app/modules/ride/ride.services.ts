/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./ride.model";
import { Driver } from "../driver/driver.model";
import { calculateFare, getDistanceInKm } from "../../utils/getDistanceAndFare";
import { IRide } from "./ride.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

const requestRide = async (req: Request) => {

    const rideData: IRide = req.body;
    const riderId = (req.user as { userId: string }).userId;

    const activeDrivers = await Driver.countDocuments({ isOnline: true });
    if (!activeDrivers) {
        throw new AppError(404, "No drivers are available at the moment.");
    }

    const distance = getDistanceInKm(
        rideData.pickup.lat,
        rideData.pickup.lng,
        rideData.destination.lat,
        rideData.destination.lng
    )
    const fare = calculateFare(distance);

    const rider = await User.findById(riderId);
    if (!rider) {
        throw new AppError(404, "User does not exist.");
    }

    if (rider.activeRide) {
        const existingRide = await Ride.findById(rider.activeRide);

        if (existingRide && existingRide.status !== "completed") {
            throw new AppError(403, "Already in an active ride.");
        }
    }

    const ride = await Ride.create(
        {
            rider: riderId,
            fare,
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
    if (!ride?.rider) {
        throw new AppError(404, "Ride does not exist.");
    }

    if (ride.rider.toString() !== riderId) {
        throw new AppError(403, "You are not allowed to cancel this ride.");
    }

    if (ride.status !== "requested") {
        throw new AppError(400, "Ride is already in progress or completed.");
    }

    const totalCanceledRide = await Ride.countDocuments({ rider: riderId, status: "canceled" });
    if (totalCanceledRide >= 5) {
        throw new AppError(400, "Reached maximum number of cancellations.");
    }

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        { status: "canceled" },
        { new: true }
    );

    const rider = await User.findByIdAndUpdate(
        riderId,
        { activeRide: null },
        { new: true }
    );

    return { updatedRide, rider };
};

const getAvailableRides = async (driverId: string) => {

    const driver = await Driver.findByIdAndUpdate(
        driverId,
        { new: true }
    );

    if (driver?.activeRide) {
        throw new AppError(403, "Already in an active ride.")
    }
    if (driver?.approvalStatus !== "approved") {
        throw new AppError(403, "Driveer is not permited for ride at this moment.")
    }

    const availableRides = await Ride.find(
        {
            status: "requested",
            "rejectedBy.driverId": { $ne: driverId }
        }
    ).populate("rider", "name");

    console.log(availableRides)

    return availableRides
}

const getMyRides = async (req: Request) => {

    // const { userId, driverId } = req.user as { userId?: string, driverId?: string };

    // const status = req.query?.status as string;

    // const filter: any = {};

    // if (driverId) filter.driver = driverId;
    // else if (userId) filter.rider = userId;

    // if (status === "pending") filter.status = { $nin: ["completed", "canceled"] };
    // else if (status === "completed") filter.status = "completed";
    // else if (status === "canceled") filter.status = "canceled";

    // const rides = await Ride.find(filter);

    // return rides

    const { userId, driverId } = req.user as { userId?: string, driverId?: string };

    const query = req.query as Record<string, string>;

    if (driverId) query.driver = driverId;
    else if (userId) query.rider = userId;

    const rideSearchableFields = ["pickup.address", "destination.address"]

    const queryBuilder = new QueryBuilder(Ride.find(), query)

    const rides = queryBuilder
        .search(rideSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    // const meta = await queryBuilder.getMeta()

    const [data, meta] = await Promise.all([
        rides.build(),
        queryBuilder.getMeta()
    ])

    return { data, meta }


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
        throw new AppError(403, "You have already rejected this ride.")
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

const acceptRide = async (rideId: string, driverId: string) => {
    const driver = await Driver.findById(driverId);

    if (!driver) {
        throw new AppError(404, "Driver not found.");
    }

    if (driver.activeRide) {
        throw new AppError(403, "Already in an active ride.");
    }

    if (driver.approvalStatus !== "approved") {
        throw new AppError(403, "Driver is not permitted for ride at this moment.");
    }

    const ride = await Ride.findOneAndUpdate(
        {
            _id: rideId,
            status: "requested",
            "rejectedBy.driverId": { $ne: driverId }
        },
        {
            driver: driverId,
            status: "accepted",
            acceptedAt: Date.now()
        },
        { new: true }
    );

    if (!ride) {
        throw new AppError(400, "Ride not found, already accepted, or you rejected it before.");
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
        driverId,
        { activeRide: rideId },
        { new: true }
    );

    return { ride, updatedDriver };
};

const updateRideStatus = async (rideId: string, driverId: string, status: string) => {
    const allowedStatuses = ['picked_up', 'in_transit', 'completed'];

    if (!allowedStatuses.includes(status)) {
        throw new AppError(400, `Invalid ride status: ${status}`);
    }

    const driver = await Driver.findById(driverId);
    if (!driver) throw new AppError(404, "Driver not found.");

    if (driver.activeRide?.toString() !== rideId) {
        throw new AppError(403, "You are not permitted to update this ride.");
    }

    const updateData: Record<string, any> = { status };

    if (status === "picked_up") {
        updateData.pickedUpAt = new Date();
    } else if (status === "completed") {
        updateData.completedAt = new Date();
    }

    const ride = await Ride.findByIdAndUpdate(rideId, updateData, { new: true });
    if (!ride) throw new AppError(404, "Ride not found.");

    if (status === "completed") {
        await Driver.findByIdAndUpdate(driverId, {
            activeRide: null,
            $inc: { totalEarnings: ride.fare }
        });
    }

    return ride;
};




export const RideServices = {
    requestRide,
    cancelRide,
    getAvailableRides,
    getMyRides,
    rejectRide,
    acceptRide,
    updateRideStatus
}