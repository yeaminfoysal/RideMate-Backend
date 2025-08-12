import z from "zod";

export const createRideZodSchema = z.object({
    rider: z.string({ message: "Rider must be string" }),
    driver: z.string({ message: "Driver must be string" }),
    pickup: z.string({ message: "pickup must be string" }),
    destination: z.string({ message: "Destination must be string" }),
    status: z.enum(['requested', 'accepted', 'picked_up', 'in_transit', 'completed']).optional()
})

export const updateRideZodSchema = z.object({
    rider: z.string({ message: "Rider must be string" }).optional(),
    driver: z.string({ message: "Driver must be string" }).optional(),
    pickup: z.string({ message: "pickup must be string" }).optional(),
    destination: z.string({ message: "Destination must be string" }).optional(),
    status: z.enum(['requested', 'accepted', 'picked_up', 'in_transit', 'completed']).optional()
})