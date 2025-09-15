import { Request } from "express";
import { Driver } from "./driver.model";
import { User } from "../user/user.model";

const createDriver = async (req: Request) => {

    const userId = (req.user as { userId?: string }).userId;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.findByIdAndUpdate(userId, { role: "DRIVER" })

    const driver = await Driver.create({
        user: userId,
        ...req.body
    });
    return driver
}

const setAvailability = async (req: Request) => {

    const user = (req.user as { userId?: string }).userId;
    const isOnline = req.body.isOnline;

    const driver = await Driver.findOneAndUpdate(
        { user },
        { isOnline },
        { new: true }
    )
    return driver
}

const setApprovalStatus = async (req: Request) => {

    const id = req.params.id;
    const approvalStatus = req.body.approvalStatus;

    const driver = await Driver.findByIdAndUpdate(
        id,
        { approvalStatus },
        { new: true }
    )
    return driver
}

const updateDriverProfile = async (req: Request) => {

    const driverId = (req.user as { driverId?: string }).driverId;;
    const vehicle = req.body.vehicle;
    const licenseNumber = req.body.licenseNumber;

    const driver = await Driver.findByIdAndUpdate(
        driverId,
        { vehicle, licenseNumber },
        { new: true }
    )
    return driver
}

export const DriverServices = {
    createDriver,
    setAvailability,
    setApprovalStatus,
    updateDriverProfile
}