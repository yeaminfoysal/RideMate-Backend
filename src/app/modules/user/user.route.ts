// /* eslint-disable no-constant-condition */

import { Router } from "express";
import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";

export const UserRoutes = Router()

UserRoutes.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)

// UserRoutes.get("/all-users", validateRequest(updateUserZodSchema), checkAuth("ADMIN", "SUPER_ADMIN"), UserControllers.getAllUsers)

// UserRoutes.patch("/:id", checkAuth("USER", "GUIDE", "ADMIN", "SUPER_ADMIN"), UserControllers.updateUser)