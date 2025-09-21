import { NextFunction, Request, Response } from "express";
import { UserServices } from "./user.services";
import { User } from "./user.model";

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

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await UserServices.getAllUsers(req)

        res.status(200).json({
            seccess: true,
            message: "All users retrived successfully",
            data: data
            // meta: {
            //     totalUsers,
            //     totalDrivers
            // }
        })
    } catch (error) {
        next(error)
    }
}

const blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const user = await UserServices.blockUser(id)

        res.status(200).json({
            seccess: true,
            message: "Block user successfully",
            data: user
        })
    } catch (error) {
        next(error)
    }
}

const unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const user = await UserServices.unblockUser(id)

        res.status(200).json({
            seccess: true,
            message: "Unblock user successfully",
            data: user
        })
    } catch (error) {
        next(error)
    }
}

const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = (req.user as { email?: string })?.email;
        const user = await User.findOne({ email })

        res.status(200).json({
            seccess: true,
            message: "Profile retrived successfully",
            data: user
        })
    } catch (error) {
        next(error)
    }
}

const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const userId = (req.user as { userId: string })?.userId;
        const user = await UserServices.updateProfile(req.body, userId);

        res.status(201).json({
            success: true,
            message: "User updated successfully",
            data: user
        })
    } catch (error) {
        next(error)
    }
}


export const UserControllers = {
    createUser,
    getAllUsers,
    blockUser,
    unblockUser,
    getMyProfile,
    updateProfile
}