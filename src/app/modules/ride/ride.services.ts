/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./ride.model";
import { Driver } from "../driver/driver.model";
import { calculateFare, getDistanceInKm } from "../../utils/getDistanceAndFare";
import { IRide } from "./ride.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { SSLService } from "../sslCommertz/sslCommertz.service";
import { ISSLCommerz } from "../sslCommertz/sslCommerz.interface";

const getTransactionId = () => {
    return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

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

    return availableRides
}

const getAllRides = async (req: Request) => {
    const query = req.query as Record<string, string>;
    const searchTerm = query.searchTerm?.toLowerCase() || "";

    // Step 1: populate rider and driver.user
    let rides = await Ride.find()
        .populate("rider", "name email")
        .populate({
            path: "driver",
            populate: { path: "user", select: "name email" }
        });

    // Step 2: In-memory search on populated fields + destination.address
    if (searchTerm) {
        rides = rides.filter((ride: any) => {
            return (
                ride.rider?.name?.toLowerCase().includes(searchTerm) ||
                ride.rider?.email?.toLowerCase().includes(searchTerm) ||
                ride.driver?.user?.name?.toLowerCase().includes(searchTerm) ||
                ride.driver?.user?.email?.toLowerCase().includes(searchTerm)
            );
        });
    }

    // Step 3: Filter by status
    if (query.status) {
        rides = rides.filter((ride: any) => ride.status === query.status);
    }

    // Step 4: Filter by requestedAt date (full day)
    if (query.requestedAt) {
        const date = new Date(query.requestedAt);
        const startOfDay = new Date(date.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setUTCHours(23, 59, 59, 999));

        rides = rides.filter(
            (ride: any) =>
                new Date(ride.requestedAt) >= startOfDay &&
                new Date(ride.requestedAt) <= endOfDay
        );
    }

    // Step 5: Filter by fare range
    if (query.minFare) rides = rides.filter((r) => (r.fare ?? 0) >= Number(query.minFare));
    if (query.maxFare) rides = rides.filter((r) => (r.fare ?? 0) <= Number(query.maxFare));

    // Step 6: Sort (optional)
    const sortField = query.sort || "requestedAt";
    const sortOrder = query.sort?.startsWith("-") ? 1 : -1;
    rides.sort((a: any, b: any) => {
        const aValue = a[sortField] ? new Date(a[sortField]).getTime() : 0;
        const bValue = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        return sortOrder * (aValue - bValue);
    });

    // Step 7: Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = rides.length;
    const totalPage = Math.ceil(total / limit);
    const paginatedRides = rides.slice((page - 1) * limit, page * limit);

    return { data: paginatedRides, meta: { page, limit, total, totalPage } };
};

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

    // if (ride?.status !== "requested") {
    //     throw new AppError(400, "Ride's status has been changed.")
    // }

    if (!ride) {
        throw new AppError(400, "Invalied ride.")
    }

    const alreadyRejected = ride.rejectedBy.some(
        driver => driver.driverId.toString() == driverId.toString()
    )

    if (alreadyRejected) {
        throw new AppError(403, "You have already rejected this ride.")
    }

    await Driver.findByIdAndUpdate(driverId, { activeRide: null })

    const updatedRide = await Ride.findByIdAndUpdate(
        rideId,
        {
            $push: {
                rejectedBy: {
                    driverId,
                    reason: reason || null,
                },
            },
            $set: { status: "requested", driver: null },
        },
        { new: true }
    )
    return updatedRide;
}

const acceptRide = async (rideId: string, driverId: string) => {
    const session = await Ride.startSession();
    session.startTransaction();

    try {
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
            {
                new: true,
                session: session
            }
        );

        if (!ride) {
            throw new AppError(400, "Ride not found, already accepted, or you rejected it before.");
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            driverId,
            { activeRide: rideId },
            { new: true, session }
        );

        // const transactionId = getTransactionId();

        // const payment = await Payment.create([{
        //     ride: ride._id,
        //     status: PAYMENT_STATUS.UNPAID,
        //     amount: ride.fare,
        //     transactionId
        // }], { session: session })

        // const updatedRide = await Ride.findOneAndUpdate(
        //     {
        //         _id: rideId,
        //     },
        //     { payment: payment[0]._id },
        //     {
        //         new: true,
        //         session: session
        //     }
        // );

        await session.commitTransaction() //transaction
        session.endSession();

        return { ride, driver: updatedDriver };

    } catch (error) {
        await session.abortTransaction()  // rollback
        session.endSession()
        console.log(error)
        throw error
    }
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

    // if (status === "completed") {
    //     await Driver.findByIdAndUpdate(driverId, {
    //         activeRide: null,
    //         $inc: { totalEarnings: ride.fare }
    //     });
    //     await User.findByIdAndUpdate(ride.rider, {
    //         activeRide: null,
    //     });
    // }

    return ride;
};

const completeRide = async (rideId: string, driverId: string) => {
    const session = await Payment.startSession();
    session.startTransaction();
    console.log(driverId)

    try {
        const transactionId = getTransactionId();

        const ride = await Ride.findById(rideId).populate("rider");
        const driver = await Driver.findById(driverId);

        if (!driver || !ride) throw new AppError(404, "Driver or Ride not found.");

        if (driver.activeRide?.toString() !== rideId) {
            throw new AppError(403, "You are not permitted to update this ride.");
        }

        const payment = await Payment.create([{
            ride: ride._id,
            status: PAYMENT_STATUS.UNPAID,
            amount: ride.fare,
            transactionId
        }], { session: session })

        const userAddress = (ride?.rider as any)?.address
        const userEmail = (ride?.rider as any)?.email
        const userPhoneNumber = (ride?.rider as any)?.phone
        const userName = (ride?.rider as any)?.name

        const sslPayload: ISSLCommerz = {
            address: userAddress || "Dhaka",
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: ride.fare as number,
            transactionId: transactionId
        }
        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        console.log(sslPayment.GatewayPageURL);

        const updatedRide = await Ride.findOneAndUpdate(
            {
                _id: rideId,
            },
            {
                status: "completed",
                payment: payment[0]._id,
                paymentUrl: sslPayment.GatewayPageURL
            },
            {
                new: true,
                session: session
            }
        );

        await Payment.findByIdAndUpdate(
            payment[0]._id,
            { paymentUrl: sslPayment.GatewayPageURL },
            { session }
        )

        await session.commitTransaction() //transaction
        session.endSession();

        return { ride: updatedRide };

    } catch (error: any) {
        await session.abortTransaction()  // rollback
        session.endSession()
        console.log(error)
        throw new AppError(403, error)
    }
}

const getRideDetails = async (rideId: string) => {

    const ride = await Ride.findById(rideId)
        .populate({
            path: "driver",
            select: "vehicle licenseNumber user",
            populate: {
                path: "user", // nested populate inside driver
                select: "name email phone"
            }
        })
        .populate("rider", "name")

    return ride;
};

const getActiveRide = async (req: Request) => {
    const { userId, driverId } = req.user as { userId?: string; driverId?: string };

    if (driverId) {
        return await Driver.findById(driverId)
            .populate("activeRide")
            .select("activeRide")
            .lean();
    }

    if (userId) {
        return await User.findById(userId)
            .populate({
                path: "activeRide",
                populate: {
                    path: "driver",
                    select: "vehicle licenseNumber",
                    populate: {
                        path: "user",
                        select: "name email phone",
                    },
                },
            })
            .select("activeRide")
            .lean();
    }

    return null;
};


export const RideServices = {
    requestRide,
    cancelRide,
    getAvailableRides,
    getAllRides,
    getMyRides,
    rejectRide,
    acceptRide,
    updateRideStatus,
    completeRide,
    getRideDetails,
    getActiveRide
}