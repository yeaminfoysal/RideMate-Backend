import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { DriverController } from "./driver.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDriverZodSchema } from "./driver.validation";

export const DriverRoute = Router();

DriverRoute.post(
    "/",
    validateRequest(createDriverZodSchema),
    checkAuth("USER"),
    DriverController.createDriver
)

DriverRoute.patch(
    "/availability",
    checkAuth("DRIVER"),
    DriverController.setAvailability
)

DriverRoute.get(
    "/availability-status",
    checkAuth("DRIVER"),
    DriverController.getAvailabilityStatus
)

DriverRoute.patch(
    "/approval/:id",
    checkAuth("ADMIN"),
    DriverController.setApprovalStatus
)

DriverRoute.get(
    "/all",
    checkAuth("ADMIN"),
    DriverController.getAllDrivers
)

DriverRoute.get(
    "/earnings",
    checkAuth("DRIVER"),
    DriverController.getMyEarnings
)