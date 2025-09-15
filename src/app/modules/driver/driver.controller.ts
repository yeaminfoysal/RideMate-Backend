import { NextFunction, Request, Response } from "express";
import { DriverServices } from "./driver.services";
import { Driver } from "./driver.model";

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
        const driver = await Driver.findById(driverId);

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: "Driver not found",
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: "All drivers retrieved successfully",
            data: driver.totalEarnings
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
    getMyEarnings
}