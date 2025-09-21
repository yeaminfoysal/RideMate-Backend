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

RideRoute.get(
    "/available",
    checkAuth("DRIVER"),
    RideController.getAvailableRides
)

RideRoute.patch(
    "/reject/:id",
    checkAuth("DRIVER"),
    RideController.rejectRide
)

RideRoute.patch(
    "/accept/:id",
    checkAuth("DRIVER"),
    RideController.acceptRide
)

RideRoute.get(
    "/all",
    checkAuth("ADMIN"),
    RideController.getAllRides
)

RideRoute.patch(
    "/status/:id",
    checkAuth("DRIVER"),
    RideController.updateRideStatus
)

RideRoute.patch(
    "/complete/:id",
    checkAuth("DRIVER"),
    RideController.completeRide
)

RideRoute.get(
    "/details/:id",
    checkAuth("ADMIN", "USER", "DRIVER"),
    RideController.getRideDetails
)

RideRoute.get(
    "/active",
    checkAuth("ADMIN", "USER", "DRIVER"),
    RideController.getActiveRide
)
