import z from "zod";

export const createDriverZodSchema = z.object({
    approvalStatus: z.enum(['none', 'suspended', 'approved']),
    onlineStatus: z.enum(['online', 'offline']),
    vehicle: z.string({ message: "Vehicle must be string" }),
    activeRide: z.string({ message: "Active ride must be string" })
})

export const updateDriverZodSchema = z.object({
    approvalStatus: z.enum(['none', 'suspended', 'approved']).optional(),
    onlineStatus: z.enum(['online', 'offline']).optional(),
    vehicle: z.string({ message: "Vehicle must be string" }).optional(),
    activeRide: z.string({ message: "Active ride must be string" }).optional()
})