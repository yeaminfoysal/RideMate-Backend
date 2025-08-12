/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserToken } from "../../utils/createUserTokens";
import { setCookie } from "../../utils/setCookie";


const credentialsLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        passport.authenticate("local", async (err: any, user: any, info: any) => {
            if (err) {
                return next(new AppError(401, err))
            }

            if (!user) {
                return next(new AppError(401, info.message))
            }

            const userTokens = createUserToken(user)

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

export const AuthController = { credentialsLogin }