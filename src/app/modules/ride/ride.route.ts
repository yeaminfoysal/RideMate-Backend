import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createRideZodSchema } from "./ride.validation";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";

export const RideRoute = Router();

RideRoute.post(
    "/request",
    validateRequest(createRideZodSchema),
    checkAuth("ADMIN", "USER", "DRIVER"),
    RideController.requestRide
)

RideRoute.patch(
    "/cancel/:id",
    checkAuth("ADMIN", "USER", "DRIVER"),
    RideController.cancelRide
)

RideRoute.get(
    "/me",
    checkAuth("ADMIN", "USER", "DRIVER"),
    RideController.getMyRides
)
