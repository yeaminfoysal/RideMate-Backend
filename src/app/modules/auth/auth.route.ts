import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import passport from "passport";
import { checkAuth } from "../../middlewares/checkAuth";

export const authRoutes = Router();

authRoutes.post("/login", AuthController.credentialsLogin);

authRoutes.post("/logout", AuthController.logout);

authRoutes.patch(
    "/change-password",
    checkAuth("USER", "DRIVER", "ADMIN"),
    AuthController.changePassword
);

authRoutes.get("/google", async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/"
    passport.authenticate("google", { scope: ["profile", "email"], state: redirect as string })(req, res, next)
})

authRoutes.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), AuthController.googleCallbackController)