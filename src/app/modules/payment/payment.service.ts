
import AppError from "../../errorHelpers/AppError";
import { Driver } from "../driver/driver.model";
import { Ride } from "../ride/ride.model";
import { User } from "../user/user.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { PAYMENT_STATUS as RIDE_PAYMENT_STATUS } from "../ride/ride.interface";
import { Payment } from "./payment.model";

// const initPayment = async (bookingId: string) => {

//     const payment = await Payment.findOne({ booking: bookingId })

//     if (!payment) {
//         throw new AppError(404, "Payment Not Found. You have not booked this tour")
//     }

//     const booking = await Booking.findById(payment.booking)

//     const userAddress = (booking?.user as any).address
//     const userEmail = (booking?.user as any).email
//     const userPhoneNumber = (booking?.user as any).phone
//     const userName = (booking?.user as any).name

//     const sslPayload: ISSLCommerz = {
//         address: userAddress,
//         email: userEmail,
//         phoneNumber: userPhoneNumber,
//         name: userName,
//         amount: payment.amount,
//         transactionId: payment.transactionId
//     }

//     const sslPayment = await SSLService.sslPaymentInit(sslPayload)

//     return {
//         paymentUrl: sslPayment.GatewayPageURL
//     }

// };

const successPayment = async (query: Record<string, string>) => {

    const session = await Payment.startSession();
    session.startTransaction()

    try {

        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PAYMENT_STATUS.PAID },
            { new: true, session: session }
        )

        if (!updatedPayment) {
            throw new AppError(401, "Payment not found")
        }

        const updatedRide = await Ride.findByIdAndUpdate(
            updatedPayment?.ride,
            { paymentStatus: RIDE_PAYMENT_STATUS.COMPLETE },
            { new: true, runValidators: true, session }
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

// const failPayment = async (query: Record<string, string>) => {

//     const session = await Booking.startSession();
//     session.startTransaction()

//     try {

//         const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
//             status: PAYMENT_STATUS.FAILED,
//         }, { new: true, runValidators: true, session: session })

//         await Booking
//             .findByIdAndUpdate(
//                 updatedPayment?.booking,
//                 { status: BOOKING_STATUS.FAILED },
//                 { runValidators: true, session }
//             )

//         await session.commitTransaction(); //transaction
//         session.endSession()
//         return { success: false, message: "Payment Failed" }
//     } catch (error) {
//         await session.abortTransaction(); // rollback
//         session.endSession()
//         // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
//         throw error
//     }
// };

// const cancelPayment = async (query: Record<string, string>) => {

//     const session = await Booking.startSession();
//     session.startTransaction()

//     try {
//         const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
//             status: PAYMENT_STATUS.CANCELLED,
//         }, { runValidators: true, session: session })

//         await Booking
//             .findByIdAndUpdate(
//                 updatedPayment?.booking,
//                 { status: BOOKING_STATUS.CANCEL },
//                 { runValidators: true, session }
//             )

//         await session.commitTransaction(); //transaction
//         session.endSession()
//         return { success: false, message: "Payment Cancelled" }
//     } catch (error) {
//         await session.abortTransaction(); // rollback
//         session.endSession()
//         // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
//         throw error
//     }
// };

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
    // initPayment,
    successPayment,
    // failPayment,
    // cancelPayment,
    // getInvoiceDownloadUrl
};