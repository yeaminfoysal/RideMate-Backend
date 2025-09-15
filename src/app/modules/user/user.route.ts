// /* eslint-disable no-constant-condition */

import { Router } from "express";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const UserRoutes = Router()

UserRoutes.post(
    "/register",
    validateRequest(createUserZodSchema),
    UserControllers.createUser
);

UserRoutes.get(
    "/all-users",
    checkAuth("ADMIN"),
    UserControllers.getAllUsers
);

UserRoutes.get(
    "/me",
    checkAuth("ADMIN", "USER", "DRIVER"),
    UserControllers.getMyProfile
);

UserRoutes.patch(
    "/block/:id",
    checkAuth("ADMIN"),
    UserControllers.blockUser
);

UserRoutes.patch(
    "/unblock/:id",
    checkAuth("ADMIN"),
    UserControllers.unblockUser
);

UserRoutes.patch(
    "/update-profile",
    checkAuth("ADMIN", "USER", "DRIVER"),
    UserControllers.updateProfile
);