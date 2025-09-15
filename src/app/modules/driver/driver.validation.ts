import z from "zod";

export const createDriverZodSchema = z.object({
    user: z
        .string({ message: "Invalid ID format" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ObjectId" }).optional(),
    approvalStatus: z.enum(['none', 'suspended', 'approved']).optional(),
    isOnline: z.boolean().optional(),
    vehicle: z.string({ message: "Vehicle must be string" }).optional(),
    licenseNumber: z.string({ message: "License must be string" }).optional(),
    activeRide: z
        .string({ message: "Active ride must be string" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ride ID format." })
        .optional()
        .nullable(),
    totalEarnings: z.number({ message: "Total earnings must be number" }).optional()
})

export const updateDriverZodSchema = z.object({
    approvalStatus: z.enum(['none', 'suspended', 'approved']).optional(),
    onlineStatus: z.enum(['online', 'offline']).optional(),
    vehicle: z.string({ message: "Vehicle must be string" }).optional(),
    activeRide: z
        .string({ message: "Active ride must be string" })
        .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid ride ID format." })
        .optional()
        .nullable(),
})