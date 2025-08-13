import { Request } from "express";
import { Driver } from "./driver.model";

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

export const DriverServices = { setAvailability }