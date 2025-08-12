import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.services";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserServices.createUser(req.body)

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        })
    } catch (error) {
        next(error)
    }
}

export const UserControllers = { createUser }