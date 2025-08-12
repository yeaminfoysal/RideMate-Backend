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

export const UserServices = { createUser }