/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { DriverServices } from "./driver.services";
import { Driver } from "./driver.model";
import { Ride } from "../ride/ride.model";
import mongoose from "mongoose";

const createDriver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driver = await DriverServices.createDriver(req);

        res.status(201).json({
            success: true,
            message: "Driver created successfully",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

const setAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driver = await DriverServices.setAvailability(req)
        res.status(200).json({
            success: true,
            message: "Updated availability status successfully.",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

const getAvailabilityStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { driverId } = req.user as { driverId?: string };
        const driver = await Driver.findById(driverId).select("isOnline activeRide");

        res.status(200).json({
            success: true,
            message: "Retrived driver availability status successfully.",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

const setApprovalStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driver = await DriverServices.setApprovalStatus(req)
        res.status(200).json({
            success: true,
            message: "Updated apprival status successfully",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

const getAllDrivers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const drivers = await Driver.find()

        res.status(200).json({
            success: true,
            message: "All drivers retrieved successfully",
            data: drivers
        })
    } catch (error) {
        next(error)
    }
}

const getMyEarnings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { driverId } = req.user as { driverId?: string };

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: "Driver ID is missing",
            });
        }

        // Fetch total earnings
        const driver = await Driver.findById(driverId).select("totalEarnings");
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
            });
        }

        // Aggregate rides for daily, weekly, and monthly earnings
        const aggregation = await Ride.aggregate([
            { $match: { driver: new mongoose.Types.ObjectId(driverId) } },
            {
                $group: {
                    _id: null,
                    daily: {
                        $push: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
                            fare: "$fare"
                        }
                    },
                    weekly: {
                        $push: {
                            year: { $isoWeekYear: "$completedAt" },
                            week: { $isoWeek: "$completedAt" },
                            fare: "$fare"
                        }
                    },
                    monthly: {
                        $push: {
                            year: { $year: "$completedAt" },
                            month: { $month: "$completedAt" },
                            fare: "$fare"
                        }
                    }
                }
            }
        ]);

        const data = aggregation[0] || { daily: [], weekly: [], monthly: [] };

        // Utility to sum fares by a key
        const sumByKey = (arr: any[], keys: string[]) => {
            const result: Record<string, number> = {};
            arr.forEach(item => {
                const key = keys.map(k => item[k]).join("-");
                result[key] = (result[key] || 0) + item.fare;
            });
            return result;
        };

        res.status(200).json({
            success: true,
            message: "Driver earnings retrieved successfully",
            data: {
                totalEarnings: driver.totalEarnings,
                daily: sumByKey(data.daily, ["date"]),
                weekly: sumByKey(data.weekly, ["year", "week"]),
                monthly: sumByKey(data.monthly, ["year", "month"])
            }
        });

    } catch (error) {
        next(error);
    }
};

const updateDriverProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driver = await DriverServices.updateDriverProfile(req)
        res.status(200).json({
            success: true,
            message: "Updated driver profile successfully.",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

const getDriverProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driverId = (req.user as { driverId: string }).driverId;
        const driver = await Driver
            .findById(driverId)
            .select("vehicle licenseNumber approvalStatus");

        res.status(200).json({
            success: true,
            message: "driver profile retrived successfully.",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

export const DriverController = {
    createDriver,
    setAvailability,
    getAvailabilityStatus,
    setApprovalStatus,
    getAllDrivers,
    getMyEarnings,
    updateDriverProfile,
    getDriverProfile
}