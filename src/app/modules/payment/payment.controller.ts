import { NextFunction, Request, Response } from "express";
import { PaymentService } from "./payment.service";

const initPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rideId = req.params.rideId;
        const result = await PaymentService.initPayment(rideId as string)

        res.status(201).json({
            success: true,
            message: "Payment done successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
};

const successPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query
        const result = await PaymentService.successPayment(query as Record<string, string>)

        if (result.success) {
            res.redirect(`${process.env.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
        }
    } catch (error) {
        next(error)
    }
};

const failPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query
        const result = await PaymentService.failPayment(query as Record<string, string>)

        if (!result.success) {
            res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}&rideId=${result.rideId}`)
        }
    } catch (error) {
        next(error)
    }
};

const cancelPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query
        const result = await PaymentService.cancelPayment(query as Record<string, string>)

        if (!result.success) {
            res.redirect(`${process.env.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}&rideId=${result.rideId}`)
        }
    } catch (error) {
        next(error)
    }
};

// const getInvoiceDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { paymentId } = req.params;
//         const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
//         res.status(200).json({
//             statusCode: 200,
//             success: true,
//             message: "Invoice download URL retrieved successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error)
//     }
// };

// const validatePayment = async (req: Request, res: Response) => {
//     console.log("sslcommerz ipn url body", req.body);

//     await SSLService.validatePayment(req.body)
//     res.status(200).json({
//         success: true,
//         message: "Payment Validated Successfully",
//         data: null,
//     })
// }

export const PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    // getInvoiceDownloadUrl,
    // validatePayment
};