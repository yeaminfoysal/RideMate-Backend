/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose"

export const handleCastError = (err: mongoose.Error.CastError) => {
    return {
        statusCode: 400,
        message: "Invalid MongoDB ObjectID. Please provide a valid id"
    }
}