import z from "zod";

const objectIdValidation = z
  .string({ message: "Invalid ID format" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ObjectId" });

const locationValidation = z.object({
  address: z.string({ message: "Address must be a string" }),
  lat: z.number({ message: "Latitude must be a number" }),
  lng: z.number({ message: "Longitude must be a number" }),
});

export const createRideZodSchema = z.object({
  rider: objectIdValidation,
  driver: objectIdValidation.optional(), // driver can be empty until accepted
  pickup: locationValidation,
  destination: locationValidation,
  status: z
    .enum(["requested", "accepted", "picked_up", "in_transit", "completed"])
    .optional(),
  fare: z.number().optional(),
});

export const updateRideZodSchema = z.object({
  rider: objectIdValidation.optional(),
  driver: objectIdValidation.optional(),
  pickup: locationValidation.optional(),
  destination: locationValidation.optional(),
  status: z
    .enum(["requested", "accepted", "picked_up", "in_transit", "completed"])
    .optional(),
  fare: z.number().optional(),
});
