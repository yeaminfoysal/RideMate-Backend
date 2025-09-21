/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errorHelpers/AppError";
import { Driver } from "../driver/driver.model";
import { Ride } from "../ride/ride.model";
import { User } from "../user/user.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { PAYMENT_STATUS as RIDE_PAYMENT_STATUS } from "../ride/ride.interface";
import { Payment } from "./payment.model";
import { ISSLCommerz } from "../sslCommertz/sslCommerz.interface";
import { SSLService } from "../sslCommertz/sslCommertz.service";

const initPayment = async (rideId: string) => {
    const session = await Ride.startSession();
    session.startTransaction()

    try {
        const payment = await Payment.findOne({ ride: rideId })

        if (!payment) {
            throw new AppError(404, "Payment Not Found.")
        }

        const ride = await Ride.findById(rideId).populate("rider")

        if (!ride) {
            throw new AppError(404, "Payment Not Found.")
        }

        const userAddress = (ride?.rider as any)?.address
        const userEmail = (ride?.rider as any)?.email
        const userPhoneNumber = (ride?.rider as any)?.phone
        const userName = (ride?.rider as any)?.name

        const sslPayload: ISSLCommerz = {
            address: userAddress || "Dhaka",
            email: userEmail,
            phoneNumber: userPhoneNumber || "01++++++++++",
            name: userName,
            amount: ride.fare as number,
            transactionId: payment.transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        await Ride.findOneAndUpdate(
            {
                _id: rideId,
            },
            {
                paymentUrl: sslPayment.GatewayPageURL
            },
            {
                new: true,
                session: session
            }
        );

        const updatedPayment = await Payment.findByIdAndUpdate(
            payment._id,
            { paymentUrl: sslPayment.GatewayPageURL },
            { session, new: true }
        )

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: true, message: "Payment Completed Successfully", updatedPayment }

    } catch (error: any) {
        await session.abortTransaction()  // rollback
        session.endSession()
        console.log(error)
        throw new AppError(403, error)
    }

};

const successPayment = async (query: Record<string, string>) => {

    const session = await Payment.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.PAID, paymentUrl: null },
            { session: session }
        )

        if (!updatedPayment) {
            throw new AppError(401, "Payment not found")
        }

        const updatedRide = await Ride.findByIdAndUpdate(
            updatedPayment?.ride,
            { paymentStatus: RIDE_PAYMENT_STATUS.COMPLETE, paymentUrl: null },
            { runValidators: true, session }
        )

        if (!updatedRide) {
            throw new AppError(401, "Ride not found")
        }

        await Driver.findByIdAndUpdate(
            updatedRide?.driver,
            {
                activeRide: null,
                $inc: { totalEarnings: updatedRide.fare }
            },
            { session }
        );

        await User.findByIdAndUpdate(
            updatedRide.rider,
            { activeRide: null },
            { session }
        );

        // const invoiceData: IInvoiceData = {
        //     bookingDate: updatedBooking.createdAt as Date,
        //     guestCount: updatedBooking.guestCount,
        //     totalAmount: updatedPayment.amount,
        //     tourTitle: (updatedBooking.tour as unknown as ITour).title,
        //     transactionId: updatedPayment.transactionId,
        //     userName: (updatedBooking.user as unknown as IUser).name
        // }

        // const pdfBuffer = await generatePdf(invoiceData)

        // const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        // if (!cloudinaryResult) {
        //     throw new AppError(401, "Error uploading pdf")
        // }

        // await Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { runValidators: true, session })

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: true, message: "Payment Completed Successfully" }

    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

const failPayment = async (query: Record<string, string>) => {

    const session = await Payment.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.FAILED, paymentUrl: null },
            { session: session }
        )

        const updatedRide = await Ride.findByIdAndUpdate(
            updatedPayment?.ride,
            { paymentStatus: RIDE_PAYMENT_STATUS.FAILED, paymentUrl: null },
            { runValidators: true, session }
        )

        if (!updatedRide) {
            throw new AppError(401, "Ride not found")
        }

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: false, message: "Payment Failed", rideId: updatedRide._id }

    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

const cancelPayment = async (query: Record<string, string>) => {

    const session = await Payment.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.CANCELLED, paymentUrl: null },
            { session: session }
        )

        const updatedRide = await Ride.findByIdAndUpdate(
            updatedPayment?.ride,
            { paymentStatus: RIDE_PAYMENT_STATUS.CANCEL, paymentUrl: null },
            { runValidators: true, session }
        )

        if (!updatedRide) {
            throw new AppError(401, "Ride not found")
        }

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: false, message: "Payment Cancelled", rideId: updatedRide._id }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

// const getInvoiceDownloadUrl = async (paymentId: string) => {
//     const payment = await Payment.findById(paymentId)
//         .select("invoiceUrl")

//     if (!payment) {
//         throw new AppError(401, "Payment not found")
//     }

//     if (!payment.invoiceUrl) {
//         throw new AppError(401, "No invoice found")
//     }

//     return payment.invoiceUrl
// };

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    // getInvoiceDownloadUrl
};