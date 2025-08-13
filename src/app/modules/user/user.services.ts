
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, Iuser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";

const createUser = async (payload: Iuser) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, auths, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(400, "User already exist")
    }
    console.log("From log: ✅", isUserExist);

    const hashedPassword = await bcrypt.hash(password, 10);

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email
    };

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })
    return user;
}

const blockUser = async (payload: string) => {
    const id = payload;

    const user = await User.findByIdAndUpdate(
        id,
        { isBlocked: true },
        { new: true }
    );

    if (!user) {
        throw new AppError(400, "User does not exist")
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
        throw new AppError(400, "User does not exist")
    }
    return user
}

export const UserServices = {
    createUser,
    blockUser,
    unblockUser
}