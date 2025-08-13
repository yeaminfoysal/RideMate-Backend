import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import { Iuser } from "../modules/user/user.interface";

export const createUserToken = (user: Partial<Iuser>, driverId?: string) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        driverId
    }

    // const accessToken = jwt.sign(jwtPayload, "secret", { expiresIn: "1d" })
    const accessToken = generateToken(jwtPayload, process.env.JWT_ACCESS_SECRET as string, "1d")

    const refreshToken = generateToken(jwtPayload, process.env.JWT_REFRESH_SECRET as string, "30d");

    const verifiedToken = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;

    console.log(verifiedToken);

    return { accessToken, refreshToken }
}

export const createNewAccessToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload

    const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

    if (!isUserExist) {
        throw new AppError(400, "User is not exist")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = generateToken(jwtPayload, process.env.JWT_ACCESS_SECRET as string, "1d");

    return accessToken;
}