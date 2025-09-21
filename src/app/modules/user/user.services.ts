
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Driver } from "../driver/driver.model";
import { IAuthProvider, Iuser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Request } from "express";

export const createUser = async (payload: Iuser) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, password, role, auths, ...rest } = payload;

        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            throw new AppError(400, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: email,
        };

        const user = await User.create(
            [
                {
                    email,
                    password: hashedPassword,
                    auths: [authProvider],
                    role,
                    ...rest,
                },
            ],
            { session }
        );

        let driver = null;
        if (role === "DRIVER") {
            driver = await Driver.create(
                [
                    {
                        user: user[0]._id,
                        ...rest,
                    },
                ],
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return { user: user[0], driver };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getAllUsers = async (req: Request) => {

    const query = req.query as Record<string, string>;

    const rideSearchableFields = ["name", "email"]

    const queryBuilder = new QueryBuilder(User.find(), query)

    const users = queryBuilder
        .search(rideSearchableFields)
        .filter()
        .sort()
        .fields()
    // .paginate()

    const [data, meta] = await Promise.all([
        users.build(),
        queryBuilder.getMeta()
    ])

    return { data, meta }
};

const blockUser = async (payload: string) => {
    const id = payload;

    const user = await User.findByIdAndUpdate(
        id,
        { isBlocked: true },
        { new: true }
    );

    if (!user) {
        throw new AppError(404, "User does not exist")
    }
    return user
}

const unblockUser = async (payload: string) => {
    const id = payload;

    const user = await User.findByIdAndUpdate(
        id,
        { isBlocked: false },
        { new: true }
    );

    if (!user) {
        throw new AppError(404, "User does not exist")
    }
    return user
}

const updateProfile = async (payload: Iuser, userId: string) => {

    let emergencyContact

    if (payload.emergencyContact) {
        emergencyContact = {
            phone: payload.emergencyContact.phone,
            email: payload.emergencyContact.email,
        };
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            emergencyContact,
            name: payload?.name,
            phone: payload?.phone
        },
        { new: true, runValidators: true }
    );

    return user;
};


export const UserServices = {
    createUser,
    blockUser,
    unblockUser,
    updateProfile,
    getAllUsers
}