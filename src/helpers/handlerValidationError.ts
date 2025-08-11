import mongoose from "mongoose"

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handlerValidationError = (err: mongoose.Error.ValidationError) => {

    const errorSources: any = []

    const errors = Object.values(err.errors)

    errors.forEach((errorObject: any) => errorSources.push({
        path: errorObject.path,
        message: errorObject.message
    }))

    return {
        statusCode: 400,
        message: "Validation Error",
        errorSources
    }


}