/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserToken } from "../../utils/createUserTokens";
import { setCookie } from "../../utils/setCookie";
import { Driver } from "../driver/driver.model";
import { authServices } from "./auth.services";


const credentialsLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        passport.authenticate("local", async (err: any, user: any, info: any) => {
            if (err) {
                return next(new AppError(401, err))
            }

            if (!user) {
                return next(new AppError(404, info.message))
            }

            let driverId;
            if (user.role == "DRIVER") {
                const driver = await Driver.findOne({ user: user._id });
                driverId = driver?._id.toString();
            }

            const userTokens = createUserToken(user, driverId)

            const userObj = user.toObject();
            delete userObj.password;

            setCookie(res, userTokens)

            res.status(200).json({
                message: "User Logged In Successfully",
                success: true,
                data: {
                    accessToken: userTokens.accessToken,
                    refreshToken: userTokens.refreshToken,
                    user: userObj
                }
            })
        })(req, res, next)

    } catch (error) {
        next(error)
    }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })

        res.status(200).json({
            message: "User logged out successfull",
            success: true,
            data: null
        })
    } catch (error) {
        next(error)
    }
}


const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oldPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const decodedToken = req.user;

        if (!decodedToken) {
            throw new AppError(400, "Invalid decoded token");
        }

        await authServices.changePassword(oldPassword, newPassword, decodedToken);

        res.status(200).json({
            message: "Password changed successfull",
            success: true,
            data: null
        })
    } catch (error) {
        next(error)
    }
}

const googleCallbackController = async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    // /booking => booking , => "/" => ""
    const user = req.user;

    if (!user) {
        throw new AppError(404, "User Not Found")
    }

    const tokenInfo = createUserToken(user)

    setCookie(res, tokenInfo)

    res.redirect(`${process.env.FRONTEND_URL}/`)
}

export const AuthController = { credentialsLogin, changePassword, logout, googleCallbackController }