import { NextFunction, Request, Response } from "express";
import { DriverServices } from "./driver.services";
import { Driver } from "./driver.model";
import { User } from "../user/user.model";

const setAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driver = await DriverServices.setAvailability(req)
        res.status(200).json({
            success: true,
            message: "Updated active successfully",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

const createDriver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as { userId?: string }).userId;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const user = await User.findByIdAndUpdate(userId, { role: "DRIVER" })
        const driver = await Driver.create({
            user: userId,
            ...req.body
        });

        res.status(200).json({
            success: true,
            message: "Driver created successfully",
            data: driver
        })
    } catch (error) {
        next(error)
    }
}

export const DriverController = { setAvailability, createDriver }