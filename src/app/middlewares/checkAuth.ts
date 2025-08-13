import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new AppError(403, "No access thoken");
        }
        const verifiedToken = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email });

        if (!isUserExist) {
            throw new AppError(400, "User is exist")
        }

        if (isUserExist?.isBlocked) {
            throw new AppError(400, "User is blocked or inactive")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permited to view this route")
        }

        req.user = verifiedToken;
        next()

    } catch (error) {
        next(error)
    }
}