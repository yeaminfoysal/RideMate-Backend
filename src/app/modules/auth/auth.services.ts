import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs"

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId);

    if (!user?.password) {
        throw new AppError(401, "User not exist")
    }

    const isOldPasswordMatched = await bcryptjs.compare(oldPassword, user.password);

    if (!isOldPasswordMatched) {
        throw new AppError(401, "Old password does not matched")
    }

    const newHashedPassword = await bcryptjs.hash(newPassword, 10)

    user.password = newHashedPassword;
    user.save()
}

export const authServices = { changePassword }